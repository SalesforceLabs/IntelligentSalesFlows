import { LightningElement, api, track, wire } from 'lwc';
import getInventoryLocations from '@salesforce/apex/MedicalDeviceReturnController.getInventoryLocations';
import todaysDate from '@salesforce/apex/MedicalDeviceReturnController.getTodaysDate';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { FlowNavigationNextEvent } from 'lightning/flowSupport';

import DATE_FIELD from '@salesforce/schema/Case.Requested_Date__c';
import QTY_FIELD from '@salesforce/schema/Case.Quantity__c';
import QTY_HANDEDOVER from '@salesforce/schema/Case.Quantity_Handedover__c';
import ACCOUNT_FIELD from '@salesforce/schema/Case.Account.Name';
import ACCOUNT_ID from '@salesforce/schema/Case.AccountId';
import CONTACT_ID from '@salesforce/schema/Case.ContactId';
import PRODUCT_ID from '@salesforce/schema/Case.ProductId';
import PRODUCT_NAME from '@salesforce/schema/Case.Product.Name';
import LOCATION_ID from '@salesforce/schema/Case.Location__c';
import CONTACT_FIELD from '@salesforce/schema/Case.Contact.Name';
import LOCATION_FIELD from '@salesforce/schema/Case.Location__r.Name';
import PRODUCT_FIELD from '@salesforce/schema/Case.Product.Name';
import FROMDATE_FIELD from '@salesforce/schema/Case.From_Date__c';
import TODATE_FIELD from '@salesforce/schema/Case.To_Date__c';
import RETURN_QUANTITY from '@salesforce/schema/Case.Quantity_Returned__c';
import SystemModstamp from '@salesforce/schema/Account.SystemModstamp';

export default class MarkAsReturn extends NavigationMixin(LightningElement) {

    @api caseId;
    @api isSample;
    @api availableActions = [];
    @api accountlabel;
    @api accountId;
    @api contactlabel;
    @api contactName;
    @api contactId;
    @api locationlabel;
    @api quantitylabel;
    @api datelabel;
    @api flowNametoInvoke;
    @api isProductDetails;
    @api productLocation;
    @api productLocationName;
    @api productId;
    @api productName;
    @api quantValue;
    @api returnDate;
    @api allProductsQuantity;
    @api quantityHandedOver;
    @api returnQuantityOnCase;
    @api cancelFlow = false;
    @track caseLocation;
    isLoaded = false;

    @track options;
    @track currentDate;
    @track remainingReturnQuantity;
    error;
    caseDetail;
    caseRecord;
    serialNumbers = [];

    @wire(getRecord, { recordId: '$caseId', fields: [PRODUCT_ID, PRODUCT_NAME, ACCOUNT_FIELD, CONTACT_FIELD, QTY_FIELD, QTY_HANDEDOVER, RETURN_QUANTITY, LOCATION_FIELD,
        PRODUCT_FIELD, ACCOUNT_ID, CONTACT_ID, LOCATION_ID, DATE_FIELD, FROMDATE_FIELD, TODATE_FIELD, ] })
    wireCase({ data, error }) {
        if (data) {
            this.isLoaded = true;
            this.caseRecord = data;
            this.caseDetail = {};
            this.productId = getFieldValue(data, PRODUCT_ID);
            this.productName = getFieldValue(data, PRODUCT_NAME);
            this.caseDetail['Account'] = getFieldValue(data, ACCOUNT_FIELD);
            this.caseDetail['Contact'] = getFieldValue(data, CONTACT_FIELD);
            this.caseDetail['Quantity'] = getFieldValue(data, QTY_FIELD);
            this.caseDetail['QantityHandedover'] = getFieldValue(data, QTY_HANDEDOVER);
            this.caseDetail['ReturnQuantity'] = getFieldValue(data, RETURN_QUANTITY);
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
            this.contactName = getFieldValue(data, CONTACT_FIELD);
            this.accountId = getFieldValue(data, ACCOUNT_ID);
            this.contactId = getFieldValue(data, CONTACT_ID);
            this.caseLocation = getFieldValue(data, LOCATION_FIELD);
            let quantity = getFieldValue(data, QTY_FIELD);
            let quantHandedover = getFieldValue(data, QTY_HANDEDOVER);
            this.quantityHandedOver = quantHandedover==null?0:quantHandedover;
            let returnQuantityOnCase = getFieldValue(data, RETURN_QUANTITY);
            this.returnQuantityOnCase = returnQuantityOnCase==null?0:returnQuantityOnCase;
            this.remainingReturnQuantity = quantHandedover-returnQuantityOnCase;
            this.todaysDate();
            this.allProductsQuantity = quantity;
            if (quantity) {
                for (let i = 1; i <= quantity; i++) {
                    this.serialNumbers.push('');
                }
            }
        } else {
            this.isLoaded = false;
        }
    }
    @wire(getInventoryLocations, { productId: '$caseDetail.ProductId' })
    wiredPrdLocations({ data, error }) {
        if (data) {
            this.options = [];
            this.options.push({ label: '--None--', value: '' });
            for (var i = 0; i < data.length; i++) {
                //alert(data[i].Name+'---'+this.caseLocation);
                if(data[i].Name == this.caseLocation){
                    this.productLocation = data[i].Id;
                    this.productLocationName = data[i].Name;
                }
                this.options.push({ label: data[i].Name, value: data[i].Id });
            }
            this.error = undefined;
        } else if (error) {
            this.options = [];
            this.options.push({ label: '--None--', value: '' });
            this.error = error;
            this.options = undefined;
        }
    }
    todaysDate(){
        todaysDate()
        .then(result => {
          this.currentDate = result;
        })
        .catch(error => {
            alert('Error'+JSON.stringify(error));
            this.error = error;
            this.oppList = undefined;
        });
    }

    handleChangeQuantity(event){
        let quantity = event.target.value;
        this.quantValue = quantity;
    }
    handleProdtLocation(event) {
        this.productLocation = event.detail.value;
        this.productLocationName = event.target.options.find(opt => opt.value === event.detail.value).label;
    }
    handleChangeReturnDate(event){
        let valDate = event.target.value;
        this.returnDate = valDate;

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
        if(this.isQuantityValid() && this.isInputValid() && this.isReturnDateValid()){
             // check if NEXT is allowed on this screen
            if (this.availableActions.find((action) => action === 'NEXT')) {
                // navigate to the next screen
                const navigateNextEvent = new FlowNavigationNextEvent();
                this.dispatchEvent(navigateNextEvent);
            }

            }
    }
    handleGoCancel(){
        this.cancelFlow = true;
         // check if NEXT is allowed on this screen
        if (this.availableActions.find((action) => action === 'NEXT')) {
        // navigate to the next screen
            const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
        }        
    }
    isQuantityValid(){
        let isValid = true;
        let quantityField = this.template.querySelectorAll('.validateQuantity');
        quantityField.forEach(quantityField => {
             if(this.remainingReturnQuantity < this.quantValue || this.quantValue <= 0){
                quantityField.setCustomValidity("Enter a value between 0 and the remaining quantity.");
                
                isValid =false;
            }
            else{
                quantityField.setCustomValidity("");
            }
            quantityField.reportValidity();
        });

        return isValid;
    }
    isReturnDateValid(){
        let isValid = true;
        let retDatTemplate = this.template.querySelectorAll('.validateDate');
        retDatTemplate.forEach(retDatTemplate => {
             if(this.returnDate > this.currentDate){
                retDatTemplate.setCustomValidity("Return Date should be a current date or past date.");
                
                isValid =false;
            }
            else{
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
            if (this.quantValue == undefined  || !!(this.quantValue % 1) || this.returnDate == undefined || this.productLocation == undefined) {
                inputField.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    }
}