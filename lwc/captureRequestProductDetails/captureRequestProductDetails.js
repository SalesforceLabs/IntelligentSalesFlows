import { LightningElement, api } from 'lwc';
import { FlowNavigationNextEvent, FlowNavigationBackEvent } from 'lightning/flowSupport';
const now = new Date(new Date().setDate(new Date().getDate() - 1));
export default class CaptureRequestProductDetails extends LightningElement {
    @api availableActions = [];
    @api fieldLabel;
    @api productId;
    @api productName;
    @api isSampleRequest;
    @api durationName;
    @api quantValue;
    @api requestedDate;
    @api fromDate;
    @api toDate;
    today = now.toISOString();


    lookupRecord(event) {
        const target = event.detail;
        this.productId = target?.selectedRecord?.Id;
        this.productName = target?.selectedRecord?.Name;
    }

    handleChangeQuantity(event) {
        this.quantValue = event.target.value;
    }

    handleChangeRequestedDate(event) {
        this.requestedDate = event.target.value;
    }

    handleChangeFromDate(event) {
        this.fromDate = event.target.value;
    }

    handleChangeToDate(event) {
        this.toDate = event.target.value;
    }

    handleGoNext() {
        this.template.querySelectorAll('lightning-input').forEach(element => {
            element.reportValidity();
        });
        if (this.productId && this.isInputValid() && this.isToDateValid() && this.validInput()) {
            // check if NEXT is allowed on this screen
            if (this.availableActions.find((action) => action === 'NEXT')) {
                // navigate to the next screen
                const navigateNextEvent = new FlowNavigationNextEvent();
                this.dispatchEvent(navigateNextEvent);
            }
        }
    }

    handleBack() {
        if (this.availableActions.find((action) => action === 'BACK')) {
            // navigate to the next screen
            const navigateNextEvent = new FlowNavigationBackEvent();
            this.dispatchEvent(navigateNextEvent);
        }
    }

    isToDateValid() {
        let isValid = true;
        let retDatTemplate = this.template.querySelectorAll('.validateToDate');
        retDatTemplate.forEach(retDatTemplate => {
            if (this.toDate < this.fromDate) {
                retDatTemplate.setCustomValidity("Select a End Date that’s equal to or after the Start Date.");
                isValid = false;
            }
            else {
                retDatTemplate.setCustomValidity("");
            }
            retDatTemplate.reportValidity();
        });

        return isValid;
    }

    isInputValid() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.validate');
        inputFields.forEach(inputField => {
            if (this.quantValue == undefined || ((this.fromDate == undefined || this.toDate == undefined) && !this.isSampleRequest) || (this.requestedDate == undefined && this.isSampleRequest)) {
                inputField.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    }

    validInput() {
        const allValid = [
            ...this.template.querySelectorAll('lightning-input'),
        ].reduce((validSoFar, inputCmp) => {
            inputCmp.reportValidity();
            return validSoFar && inputCmp.checkValidity();
        }, true);
        return allValid;
    }

}