import { LightningElement, api, track, wire } from 'lwc';
import getProductLocations from '@salesforce/apex/FetchRecordLists.getProductLocations';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { FlowNavigationNextEvent , FlowNavigationPauseEvent   } from 'lightning/flowSupport';

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

    @api caseId;
    @api isSample;
    @api availableActions = [];
    @api accountlabel;
    @api contactlabel;
    @api locationlabel;
    @api quantitylabel;
    @api datelabel;
    @api serialNumbers = [];
    @api flowNametoInvoke;
    @track rows = [];
    isLoaded = false;

    @track options;
    productLocation;
    error;
    caseDetail;
    caseRecord;

    @wire(getRecord, { recordId: '$caseId', layoutTypes: ['Full'], modes: ['View'] })
    wireCase({ data, error }) {
        if (data) {
            this.isLoaded = true;
            this.caseRecord = data;
            this.caseDetail = {};
            this.caseDetail['Account'] = getFieldValue(data, ACCOUNT_FIELD);
            this.caseDetail['Contact'] = getFieldValue(data, CONTACT_FIELD);
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
        } else {
            this.isLoaded = false;
        }
    }

    connectedCallback() {
        if (this.serialNumbers.length) {
            for (let i = 0; i < this.serialNumbers.length; i++) {
                this.rows.push({ serialNumber: this.serialNumbers[i] });
            }
        }
    }

    @wire(getProductLocations, { accountId: '$caseDetail.AccountId', productId: '$caseDetail.ProductId' })
    wiredPrdLocations({ data, error }) {
        if (data) {
            //alert('-->data'+data);
            this.options = [];
            for (var i = 0; i < data.length; i++) {
                this.options.push({ label: data[i].Location.Name, value: data[i].Location.Id });
            }
            this.error = undefined;
        } else if (error) {
            console.log(error)
            this.error = error;
            this.options = undefined;
        }
    }


    handleChange(event) {
        let index = event.target.dataset.index;
        this.rows[index].serialNumber = event.target.value;
        console.log(this.rows);
    }

    handleProdtLocation(event) {
        this.productLocation = event.detail.value;
    }

    handleUrl(event) {

        const recordId = event.target.dataset.id;
        const objectApiName = event.target.dataset.name;
        console.log(recordId);
        console.log(objectApiName);
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
        this.serialNumbers = this.rows.map(row => row.serialNumber);
        console.log(this.serialNumbers)
        // check if NEXT is allowed on this screen
        if (this.availableActions.find((action) => action === 'NEXT')) {
            // navigate to the next screen
            const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
        }
    }

    handleCancel(event) {
        console.log('test',this.availableActions)
        try {
            if (this.availableActions.find((action) => action === 'PAUSE')) {
                // navigate to the next screen
                const navigateNextEvent = new FlowNavigationPauseEvent();
                this.dispatchEvent(navigateNextEvent);
            }
        } catch (error) {
            console.log(error)
        }
        //event.preventDefault();
        

       /* const flowDetails = { 'flowName': this.flowNametoInvoke };
        const filterChangeEvent = new CustomEvent('invokeflow', {
            detail: { flowDetails }, bubbles: true, composed: true
        });
        this.dispatchEvent(filterChangeEvent);*/

    }
}