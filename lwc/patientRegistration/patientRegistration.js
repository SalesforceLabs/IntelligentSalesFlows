import { LightningElement, api, wire, track } from 'lwc';
import getContacts from '@salesforce/apex/PatientRegistrationController.getContacts';
import { FlowNavigationNextEvent, FlowNavigationBackEvent } from 'lightning/flowSupport';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import Account_OBJECT from '@salesforce/schema/Account';
const DELAY = 300;
export default class PatientRegistration extends LightningElement {
    @api availableActions = [];

    @track data = [];
    modalMessageNew = 'Patient Record will be created by Submitting these details. Are you sure you want to submit & register?'
    modalMessageExisting = 'Are you sure you want to register this Patient?';
    contactType;
    contactName;
    contactId;
    errorMessage;

    showPopup = false;
    @api popupHeader = 'Confirm to Register';
    @api popupMessage;

    totalRecords;
    rowLimit = 5;
    rowOffSet = 0;
    error;
    isLoading;
    queryTerm = '';

    @wire(getObjectInfo, { objectApiName: Account_OBJECT })
    objectInfo;

    get recordTypeId() {
        // Returns a map of record type Ids 
        const rtis = this.objectInfo.data.recordTypeInfos;
        return Object.keys(rtis).find(rti => rtis[rti].name === 'Person Account');
    }

    get options() {
        return [
            { label: 'Search from existing records', value: 'existing' },
            { label: 'Create New', value: 'new' },
        ];
    }

    async handleKeyChange(event) {
        this.isLoading = true;
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        this.delayTimeout = setTimeout(() => {
            this.queryTerm = searchKey;
            if (this.queryTerm.length !== 0)
                this.handleSearch();
            else
                this.data = undefined; this.isLoading = false;
        }, DELAY);
    }

    async handleSearch() {
        this.totalRecords = 0;
        this.rowLimit = 5;
        this.rowOffSet = 0;
        await this.loadData([]).then(() => {
            this.isLoading = false;
        });
    }

    loadData(data) {
        return getContacts({
            queryTerm: this.queryTerm,
            limitSize: this.rowLimit,
            offset: this.rowOffSet
        }).then(result => {
            this.totalRecords = result?.totalRecords;
            this.prepareData(result?.records, data);
        }).catch(error => {
            this.error = error;
            if (Array.isArray(error.body)) {
                this.errorMessage = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                this.errorMessage = error.body.message;
            }
            this.data = undefined;
        });
    }

    get isNew() {
        return this.contactType === 'new';
    }

    get isExisting() {
        return this.contactType === 'existing'
    }

    prepareData(result, data) {
        console.table(result)
        let newData = result.map(row => {
            return {
                ...row, AccountWebsite: row.Account?.Website,
                AccountOwner: row.Account?.Owner?.Name,
                checked: row.Id == this.contactId ? true : false
            }
        });
        this.data = [...data, ...newData];
        this.error = undefined;
    }

    handleChange(event) {
        this[event.target.name] = event.detail.value;
    }

    closeModal() {
        this.showPopup = false;
    }

    handleGoNext() {
        if (this.contactType !== 'new')
            this.popupMessage = this.modalMessageExisting;
        else
            this.popupMessage = this.modalMessageNew;
        this.showPopup = true;
        this.template.querySelector('lightning-record-edit-form').submit()
    }

    handleConfirmButton() {
        this.showPopup = false;
        if (this.availableActions.find((action) => action === 'NEXT')) {
            // navigate to the next screen
            const navigatenNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigatenNextEvent);
        }
    }

    handlePrevious() {
        if (this.availableActions.find((action) => action === 'BACK')) {
            // navigate to the next screen
            const navigateBackEvent = new FlowNavigationBackEvent();
            this.dispatchEvent(navigateBackEvent);
        }
    }
    handleSuccess(event) {
        const payload = event.detail;
    }
    
}