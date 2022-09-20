import { LightningElement, api, track } from "lwc";
import { LABELS } from "./eSignatureLabel";
import TIMEZONE from "@salesforce/i18n/timeZone";
import { ResizeObserver } from "./esigantureResizeObserver";
import { createRecord } from "lightning/uiRecordApi";
import DS_OBJECT from '@salesforce/schema/DigitalSignature';
import { FlowNavigationNextEvent, FlowNavigationBackEvent } from 'lightning/flowSupport';
export default class ESignature extends LightningElement {
    labels = LABELS;
    @api authFormId;
    @api headerMessage = this.labels.Header2;
    @api acknowledgementText = this.labels.Acknowledgement2;
    @api signedBy;
    @api digitalSignatureFields = {};
    @api doneAction = 'saveSignature'; // can be 'saveSignature' or 'getSignature'
    @api trackSignatureCapture = false;
    @api hideHeader = false;
    @api hideFooterButtons = false;
    @api canvasWidth;
    @api availableActions = [];
    @api popupHeader;
    @api popupMessage;
    @api flowNametoInvoke;
    @api contactName;
    @api isBackButtonEnabled = false;
    @api deviceTypeName;
    @api isterminateflow = false;
    @api flowType;
    @track signatureonPopup = true;
    @track showPopupApp;

    canvas;
    context;
    drawingEnabled = false;
    xPrev;
    yPrev;
    signatureColor = "black";
    signatureLineWidth = 2;
    userTimeZone = TIMEZONE;
    digSigFieldsMutable;
    // The current date and time is used if the parent component does not provide the SignedDate field in digitalSignatureFields. The SignedDate should be provided as an ISO string.
    signedDateTime = new Date().toISOString();
    constructor() {
        super();
        this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));
    }
    connectedCallback() {
        this.digSigFieldsMutable = Object.assign({}, this.digitalSignatureFields);
        const inputTime = this.digSigFieldsMutable.SignedDate;
        if (inputTime !== undefined && inputTime !== null) {
            this.signedDateTime = inputTime;
        } else {
            this.digSigFieldsMutable.SignedDate = this.signedDateTime;
        }
    }
    renderedCallback() {
        if(this.signatureonPopup){
            this.resizeObserver.observe();
            const canvas = this.template.querySelector("canvas");
            this.canvas = canvas;
            // subtracting 4 for the 2px border on the sides
            canvas.width = this.canvasWidth === undefined ? canvas.parentElement.clientWidth - 4 : this.canvasWidth;
        }

    }
    disconnectedCallback() {
        this.resizeObserver.disconnect();
    }
    handleResize() {
        const canvas = this.template.querySelector("canvas");
        // subtracting 4 for the 2px border on the sides
        canvas.width = canvas.parentElement.clientWidth - 4;
        // Setting canvas width dynamically clears the canvas.
        if (this.trackSignatureCapture) {
            this.dispatchSignature('TRACK');
        }
    }
    handleMouseMove(event) {
        if (this.drawingEnabled) {
            const rect = this.canvas.getBoundingClientRect();
            this.drawSignature(event.clientX - rect.left, event.clientY - rect.top);
        }
    }
    handleCancel(){
        this.isterminateflow = true;
        if (this.availableActions.find((action) => action === 'NEXT')) {
            // navigate to the next screen
            const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
        }
    }

    handleMouseUp() {
        this.drawingEnabled = false;
        // Don't enable the button on tapping into the input box. (signatureData will be null until a user draws something)
        if (this.checkForValidSignature()) {
            this.toggleDoneButton('enable');
        }
        if (this.trackSignatureCapture) {
            this.dispatchSignature('TRACK');
        }
    }
    handleMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.drawingEnabled = true;
        this.xPrev = event.clientX - rect.left;
        this.yPrev = event.clientY - rect.top;
    }
    // Touch events
    handleTouchStart(event) {
        event.preventDefault();
        const touch = event.touches[0];
        this.drawingEnabled = true;
        const mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }
    handleTouchEnd(event) {
        event.preventDefault();
        const mouseEvent = new MouseEvent("mouseup", {});
        this.canvas.dispatchEvent(mouseEvent);
    }
    handleTouchMove(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }
    drawSignature(xPos, yPos) {
        if (this.context === undefined) {
            this.context = this.canvas.getContext("2d");
        }
        this.context.beginPath();
        this.context.moveTo(this.xPrev, this.yPrev);
        this.context.lineTo(xPos, yPos);
        this.context.strokeStyle = this.signatureColor;
        this.context.lineWidth = this.signatureLineWidth;
        this.context.closePath();
        this.context.stroke();
        this.xPrev = xPos;
        this.yPrev = yPos;
    }
    eraseSignature() {
        const canvas = this.template.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        // disable done button since canvas is blank now
        this.toggleDoneButton('disable');
        this.dispatchClearAction();
        if (this.trackSignatureCapture) {
            this.dispatchSignature('TRACK');
        }
    }
    checkForValidSignature() {
        const canvas = this.template.querySelector("canvas");
        const context = canvas.getContext('2d');
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        let drawn = false;
        for (let i = 0; i < imageData.data.length; i++) {
            // Consider signature as valid if there is at least one data point
            if (imageData.data[i]) {
                drawn = true;
                // enable done button since a valid signature is present on the canvas
                this.toggleDoneButton('enable');
                break;
            }
        }
        return drawn;
    }
    toggleDoneButton(action) {
        if (!this.hideFooterButtons) {
            const doneButton = this.template.querySelector('button.done');
            if (action === 'enable') {
                doneButton.removeAttribute('disabled');
            } else {
                doneButton.setAttribute('disabled', 'true');
            }
        }
    }
    fireSignatureActionEvent(eventParams) {
        const signatureActionEvent = new CustomEvent("signatureaction", { detail: eventParams });
        this.dispatchEvent(signatureActionEvent);
    }
    dispatchClearAction() {
        const eventParams = {
            type: 'CLEAR',
            state: 'SUCCESS',
            signatureData: null,
            digitalSignatureId: null,
            errorMessage: null
        };
        this.fireSignatureActionEvent(eventParams);
    }


    handleDone() {
        this.signatureonPopup = false;
        this.showPopupApp = true;
    }

    generateDigitalSignature() {
        //alert('order Id' + this.orderId);
        this.digSigFieldsMutable.ParentId = this.authFormId;
        this.digSigFieldsMutable.DocumentName = 'Medical Device Request';
        this.digSigFieldsMutable.DocumentBody = this.canvas.toDataURL().substring(22);
        this.digSigFieldsMutable.DocumentContentType = 'image/png';
        const recordInput = { apiName: DS_OBJECT.objectApiName, fields: this.digSigFieldsMutable };
        return recordInput;
    }
    dispatchSignature(eventType) {
        const eventParams = {
            type: eventType,
            state: 'SUCCESS',
            signatureData: this.checkForValidSignature() ? this.canvas.toDataURL() : null,
            digitalSignatureId: null,
            errorMessage: null
        };
        this.fireSignatureActionEvent(eventParams);
    }
    @api
    getSignature() {
        this.dispatchSignature('GET');
    }
    @api
    saveSignature() {
        const signature = this.canvas.toDataURL();
        //alert('-->signature' + signature);
        const eventParams = {
            type: 'SAVE',
            signatureData: signature,
            digitalSignatureId: null,
            errorMessage: null
        };
        // if parentId is available then create the Digital Signature record
        const recordInput = this.generateDigitalSignature();
        //recordInput.Name
        //alert('-->recordInput' + JSON.stringify(recordInput));
        createRecord(recordInput)
            .then(digitalSig => {
                eventParams.state = "SUCCESS";
                //this.showPopupApp = true;
                eventParams.digitalSignatureId = digitalSig.id;
                this.fireSignatureActionEvent(eventParams);
            })
            .catch(error => {
                alert('Failur' + JSON.stringify(error));
                eventParams.state = "ERROR";
                eventParams.errorMessage = error.body.message;
                this.fireSignatureActionEvent(eventParams);
            });
    }
    closeModal() {
        this.signatureonPopup = false;
        this.showPopupApp = false;
    }

    handleConfirmButton() {
        this.signatureonPopup = true;
        this.showPopupApp = false;
        if (this.doneAction === 'getSignature') {
            this.getSignature();
        } else if (this.doneAction === 'saveSignature') {
            this.saveSignature();
        }

        if (this.availableActions.find((action) => action === 'NEXT')) {
            // navigate to the next screen
            const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
        }

    }

    dispatchCancelAction() {
        try {
            
            if (this.availableActions.find((action) => action === 'BACK')) {
                // navigate to the next screen
                const navigateBackEvent = new FlowNavigationBackEvent();
                this.dispatchEvent(navigateBackEvent);
            }
        } catch (error) {
            console.error(error)
        }
    }

    get isRequestFlow() {
        return this.flowType === 'request';
    }

    get isHandingoverFlow() {
        return this.flowType === 'handingover';
    }

    get isRetrievalFlow() {
        return this.flowType === 'retrieval';
    }

}