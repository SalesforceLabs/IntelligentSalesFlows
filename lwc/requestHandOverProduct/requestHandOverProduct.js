import { LightningElement, api, track, wire } from 'lwc';
import getProductLocations from '@salesforce/apex/MedicalDeviceRequestController.getProductLocations';
import getSerilizedProducts from '@salesforce/apex/MedicalDeviceRequestController.fetchSerilizedProductsforHandover';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { FlowNavigationNextEvent } from 'lightning/flowSupport';

import DATE_FIELD from '@salesforce/schema/Case.Requested_Date__c';
import QTY_FIELD from '@salesforce/schema/Case.Quantity__c';
import ACCOUNT_FIELD from '@salesforce/schema/Case.Account.Name';
import ACCOUNT_ID from '@salesforce/schema/Case.AccountId';
import CONTACT_ID from '@salesforce/schema/Case.ContactId';
import PRODUCT_ID from '@salesforce/schema/Case.ProductId';
import LOCATION_ID from '@salesforce/schema/Case.Location__c';
import CONTACT_FIELD from '@salesforce/schema/Case.Contact.Name';
import LOCATION_FIELD from '@salesforce/schema/Case.Location__r.Name';
import PRODUCT_FIELD from '@salesforce/schema/Case.Product.Name';
import FROMDATE_FIELD from '@salesforce/schema/Case.From_Date__c';
import TODATE_FIELD from '@salesforce/schema/Case.To_Date__c';

export default class RequestHandOverProduct extends NavigationMixin(LightningElement) {
    @api cancelFlow = false;
    @api caseId;
    @api isSample;
    @api availableActions = [];
    @api accountlabel;
    @api contactlabel;
    @api locationlabel;
    @api quantitylabel;
    @api datelabel;
    @api serialNumbers = [];
    @api productLocation;
    @api serialNumbersLength = 0;
    @api handoverDetailsHeader;
    @api handoverProductHeader;
    @api contactName;
    @track allSerlializedProducts = [];
    @track rows = [];
    @track LocationList;
    isLoaded = false;

    @track options = [];
    error;
    caseDetail;

    @wire(getRecord, { recordId: '$caseId', fields: [DATE_FIELD, QTY_FIELD, ACCOUNT_FIELD, ACCOUNT_ID, CONTACT_ID, PRODUCT_ID, LOCATION_ID, CONTACT_FIELD, LOCATION_FIELD, PRODUCT_FIELD, FROMDATE_FIELD, TODATE_FIELD] })//layoutTypes: ['Full'], modes: ['View']
    wireCase({ data, error }) {
        if (data) {
            this.isLoaded = true;
            this.caseDetail = {};
            this.caseDetail['Account'] = getFieldValue(data, ACCOUNT_FIELD);
            this.caseDetail['Contact'] = getFieldValue(data, CONTACT_FIELD);
            this.contactName = getFieldValue(data, CONTACT_FIELD);
            this.caseDetail['Quantity'] = getFieldValue(data, QTY_FIELD);
            this.caseDetail['Location'] = getFieldValue(data, LOCATION_FIELD);
            this.caseDetail['Product'] = getFieldValue(data, PRODUCT_FIELD);
            this.caseDetail['AccountId'] = getFieldValue(data, ACCOUNT_ID);
            this.caseDetail['ContactId'] = getFieldValue(data, CONTACT_ID);
            this.caseDetail['LocationId'] = getFieldValue(data, LOCATION_ID);
            this.caseDetail['ProductId'] = getFieldValue(data, PRODUCT_ID);
            let requestedDate = new Date(getFieldValue(data, DATE_FIELD));
            let StartDate = new Date(getFieldValue(data, FROMDATE_FIELD));
            let EndDate = new Date(getFieldValue(data, TODATE_FIELD));
            this.caseDetail['Date'] = requestedDate?.toLocaleDateString();
            this.caseDetail['StartDate'] = StartDate?.toLocaleDateString();
            this.caseDetail['EndDate'] = EndDate?.toLocaleDateString();
            let quantity = getFieldValue(data, QTY_FIELD);
            if (quantity && this.serialNumbers.length == 0) {
                for (let i = 1; i <= quantity; i++) {
                    this.rows.push({ serialNumber: '' });
                }
            }
        } else if (error) {
            this.error = error;
            this.isLoaded = false;
            console.error(error);
        }
    }

    connectedCallback() {
        if (this.serialNumbers.length) {
            for (let i = 0; i < this.serialNumbers.length; i++) {
                this.rows.push({ serialNumber: this.serialNumbers[i] });
            }
        }
    }

    get isLoaded() {
        return !this.wiredPrdLocations.data && !this.wiredPrdLocations.error;
    }

    @wire(getProductLocations, { accountId: '$caseDetail.AccountId', productId: '$caseDetail.ProductId' })
    wiredPrdLocations({ data, error }) {
        this.options = [];
        this.options.push({ label: '--None--', value: '' });
        if (data) {
            this.LocationList = data;
            for (var i = 0; i < this.LocationList.length; i++) {
                this.options.push({ label: this.LocationList[i].Name, value: this.LocationList[i].Id });
            }
        }
        else {
            this.error = undefined;
        }
    }

    @wire(getSerilizedProducts, { productId: '$caseDetail.ProductId', locationId: '$productLocation' })
    wiredSerilizedProducts({ data, error }) {
        if (data) {
            this.allSerlializedProducts = data;
            let quantity = this.caseDetail.Quantity;
            this.rows = [];
            if (quantity && this.serialNumbers.length == 0) {
                for (let i = 1; i <= quantity; i++) {
                    this.rows.push({ serialNumber: '' });
                }
            }
            this.error = undefined;
        } else if (error) {
            this.error = error;
            console.error(error);
        }
    }

    handleChange(event) {
        let index = event.target.dataset.index;

        let enteredValue = this.template.querySelector("[data-target-id='" + index + "']");
        let enteredSerialNumber = enteredValue.value;

        if (enteredSerialNumber && this.allSerlializedProducts.length == 0)
            enteredValue.setCustomValidity('No Serialized Products found at the selected Product location');
        else if (enteredSerialNumber && !this.allSerlializedProducts.includes(enteredSerialNumber))
            enteredValue.setCustomValidity('Please enter valid Serial Number');
        else if (enteredSerialNumber && this.rows.length > 1 && this.rows.find(e => e.serialNumber == enteredSerialNumber))
            enteredValue.setCustomValidity('Duplicate Serial Number Entered');
        else
            enteredValue.setCustomValidity('');

        enteredValue.reportValidity();
        if(this.allSerlializedProducts.includes(enteredSerialNumber)){
            this.rows[index].serialNumber = enteredSerialNumber;
        } else {
            this.rows[index].serialNumber = "";
        }
    }


    handleProdtLocation(event) {
        this.productLocation = event.detail.value;
    }

    handleUrl(event) {

        const recordId = event.target.dataset.id;
        const objectApiName = event.target.dataset.name;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: objectApiName,
                actionName: 'view'
            }
        });
    }

    handleGoNext() {
        if (this.isInputValid()) {
            this.serialNumbers = this.rows.map(row => row.serialNumber);

            for (let i = 0; i < this.serialNumbers.length; i++) {
                if (this.serialNumbers[i] != '') {
                    this.serialNumbersLength = this.serialNumbersLength + 1;
                }
            }

            // check if NEXT is allowed on this screen
            if (this.availableActions.find((action) => action === 'NEXT')) {
                // navigate to the next screen
                const navigateNextEvent = new FlowNavigationNextEvent();
                this.dispatchEvent(navigateNextEvent);
            }
        }
    }

    handleCancel() {
        this.cancelFlow = true;
        // check if NEXT is allowed on this screen
        if (this.availableActions.find((action) => action === 'NEXT')) {
            // navigate to the next screen
            const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
        }
    }

    isInputValid() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.validate');
        inputFields.forEach(inputField => {
            if (!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    }
}