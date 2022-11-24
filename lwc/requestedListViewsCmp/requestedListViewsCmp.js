import { LightningElement, track, wire, api } from 'lwc';
import fetchCaseRequests from '@salesforce/apex/MedicalDeviceRequestController.fetchCaseRequests';
import fetchAllCaseRequests from '@salesforce/apex/MedicalDeviceRequestController.fetchAllCaseRequests';
import { NavigationMixin } from 'lightning/navigation';

export default class RequestedListViewsCmp extends NavigationMixin(LightningElement) {
    @api title;
    @api caseType;
    @api caseStatus;
    @api viewLists;
    @api showRequestedListViews;
    @api openTitleheaderName;
    @api approvedTitleHeaderName;
    @api newFlowInvoke;
    @api handOverFlowInvoke;
    @api listviewQuantity;
    @api listviewDuration;
    @api isSampleRequest;
    @track headerName;
    //@track caseStatus;
    @track selectedListView;
    @track recordsCount =0;
    @track isLoadingData;
    //@track viewLists = true;
    @track isHandOver = false;
    @track isOpenReq = false;
    //@track isButtonClicked = false;
    @track isApprovedReq = false;
    @track backLabel = '< Back';
    @api newButtonLabel = 'New';
    @track records = [];
    @track rowLimit = 4;
    @track rowOffSet = 0;
    @track approvedRecordsCount = 0;
    @track openRecordsCount = 0;
    @track listViews = [];

    connectedCallback() {
        this.loadAllRecords();
        if (this.caseStatus == 'In Review') {
            this.isHandOver = false;
            this.headerName = this.openTitleheaderName;
        }
        else if (this.caseStatus == 'Approved') {
            this.isHandOver = true;
            this.headerName = this.approvedTitleHeaderName;
        }
    }

    handleNewRequest(event) {
        //invoke lightning comp to lauch flow
        //Pass parameters to flow through input variable
        event.preventDefault();
        const flowDetails = { 'flowName': this.newFlowInvoke };
        const filterChangeEvent = new CustomEvent('invokeflow', {
            detail: { flowDetails },
        });
        this.dispatchEvent(filterChangeEvent);
    }

    handleSelectedListView(event) {
        event.preventDefault();
        this.selectedListView = event.currentTarget.dataset.id;
        this.rowOffSet = 0;
        this.recordsCount =0;
        //this.isLoadingData = true;
        this.records = [];
        if (this.selectedListView == 'open_Requests') {
            this.records = [];
            this.isHandOver = false;
            this.viewLists = false;
            this.showRequestedListViews = true;
            this.caseStatus = 'In Review';
            this.headerName = this.openTitleheaderName + '(' + this.openRecordsCount + ')';
            this.loadData();
        } else if (this.selectedListView == 'Approved_Requests') {
            this.records = [];
            this.viewLists = false;
            this.showRequestedListViews = true;
            this.caseStatus = 'Approved';
            this.isHandOver = true;
            this.headerName = this.approvedTitleHeaderName + '(' + this.approvedRecordsCount + ')';
            this.loadData();
        }
    }

    handleHandOver(event) {
        const caseId = event.target.dataset.value;
        const flowDetails = { 'flowName': this.handOverFlowInvoke, 'caseId': caseId };
        const filterChangeEvent = new CustomEvent('invokeflow', {
            detail: { flowDetails },
        });
        this.dispatchEvent(filterChangeEvent);
    }

    loadData() {
        return fetchCaseRequests({ status: this.caseStatus, type: this.caseType, limitSize: this.rowLimit, offset: this.rowOffSet })
            .then(result => {
                if(result.length ==0){
                    this.isLoadingData = false;
                }else if(result.length >2){
                    this.isLoadingData = true;
                }else{
                    this.isLoadingData = false;
                }
                let newRecords = result.map(row => {
                    return {
                        ...row,
                        AccountName: row.AccountId != undefined ? row.Account.Name : '',
                        ProductName: row.ProductId != undefined ? row.Product.Name : '',
                        ContactName: row.ContactId != undefined ? row.Contact.Name : '',
                        LocationName: row.Location__c != undefined ? row.Location__r.Name : ''
                    }
                })

                this.records = this.records.concat(newRecords);
                this.recordsCount = this.records.length;
                this.error = undefined;
            })
            .catch(error => {
                alert('error' + error);
                this.error = error;
                this.records = undefined;
            });
    }
    loadAllRecords() {
        fetchAllCaseRequests({type: this.caseType})
            .then(result => {
                this.approvedRecordsCount = result.approvedRecCount;
                this.openRecordsCount = result.openRecCount;
                this.listViews = [
                    { 'label': 'Open Requests (' + this.openRecordsCount + ')', value: 'open_Requests' },
                    { 'label': 'Approved Requests (' + this.approvedRecordsCount + ')', value: 'Approved_Requests' }
                ];
                this.error = undefined;
            })
            .catch(error => {
                alert('error' + error);
                this.error = error;
                this.approvedRecordsCount = undefined;
                this.openRecordsCount = undefined;
            });
    }
    handleLoadMore(event) {
        const currentRecord = this.records;
        const { target } = event;
        target.isLoading = true;

        this.rowOffSet = this.rowOffSet + this.rowLimit;
        this.loadData()
            .then(() => {
                target.isLoading = false;
            });
    }

    handleURLCase(event) {
        const recordId = event.target.dataset.ref;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Case',
                actionName: 'view'
            }
        });
    }

    handleURLAcc(event) {
        const recordId = event.target.dataset.acc;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Account',
                actionName: 'view'
            }
        });
    }

    handleURLCon(event) {
        const recordId = event.target.dataset.con;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Contact',
                actionName: 'view'
            }
        });
    }

    handleURLLoc(event) {
        const recordId = event.target.dataset.loc;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Location',
                actionName: 'view'
            }
        });
    }
    handleBackToListView() {
        this.showRequestedListViews = false;
        this.viewLists = true;
    }
}