import { LightningElement, track, wire, api } from 'lwc';
import fetchCaseReturns from '@salesforce/apex/MedicalDeviceReturnController.fetchCaseReturns';
import fetchAllCaseReturns from '@salesforce/apex/MedicalDeviceReturnController.fetchAllCaseReturns';
import { NavigationMixin } from 'lightning/navigation';

export default class ReturnsListViewCmp extends NavigationMixin(LightningElement) {
    @api title;
    @api caseType;
    @api viewReturnListButtons;
    @api showReturnListViews;
    @api loanReturnsTitleheaderName;
    @api trialReturnsTitleHeaderName;
    @api newFlowInvoke;
    @api returnFlowInvoke;
    @api listviewQuantity;
    @api listviewDuration;
    //@track isLoadingSpinner;
    @track headerName;
    @track selectedListView;
    @track recordsCount = 0;
    @track isLoadingData;
    @track isOpenReq = false;
    @track isApprovedReq = false;
    @track backLabel = '< Back';
    @track records = [];
    @track rowLimit = 4;
    @track rowOffSet = 0;
    @track listViews = [];
    @track loanRecCount = 0;
    @track trialRecCount = 0;
    
    connectedCallback() {
        this.loadAllRecords();
        if (this.caseType == 'Loan Device Return') {
            this.headerName = this.loanReturnsTitleheaderName;
        }
        else if (this.caseType == 'Trial Device Return') {
            this.headerName = this.trialReturnsTitleHeaderName;
        }
    }
    loadAllRecords() {
        fetchAllCaseReturns()
            .then(result => {
                this.loanRecCount = result.loanRecCount;
                this.trialRecCount = result.trialRecCount;
                this.listViews = [
                    { 'label': 'Loaned Products (' + this.loanRecCount + ')', value: 'Loaner_Returns' },
                    { 'label': 'Trial Products (' + this.trialRecCount + ')', value: 'Trial_Returns' }
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
    handleSelectedListView(event) {
        event.preventDefault();
        this.selectedListView = event.currentTarget.dataset.id;
        this.rowOffSet = 0;
        this.recordsCount =0;
        //this.isLoadingData = true;
        this.records = [];
        if (this.selectedListView == 'Loaner_Returns') {
            //this.isHandOver = false;
            this.viewReturnListButtons = false;
            this.showReturnListViews = true;
            this.caseType = 'Loan Device Return';
            this.listviewDuration = 'Loan End date';
            this.headerName = this.loanReturnsTitleheaderName + '(' + this.loanRecCount + ')';
            this.returnFlowInvoke = 'Loaner_Return';
            this.loadData();
           
        } else if (this.selectedListView == 'Trial_Returns') {
            this.viewReturnListButtons = false;
            this.showReturnListViews = true;
            this.caseType = 'Trial Device Return';
            this.listviewDuration = 'Trial End date';
            //this.isHandOver = true;
            this.headerName = this.trialReturnsTitleHeaderName + '(' + this.trialRecCount + ')';
            this.returnFlowInvoke = 'Trial_Return';
            this.loadData();
           
        }
    }

    handleMarkasReturn(event) {
        const caseId = event.target.dataset.value;
        //alert('Value'+caseId);
        const flowDetails = { 'flowName': this.returnFlowInvoke, 'caseId': caseId };
        const filterChangeEvent = new CustomEvent('invokeflow', {
            detail: { flowDetails },
        });
        this.dispatchEvent(filterChangeEvent);
    }

    loadData() {
        //this.isLoadingSpinner = true;
        return fetchCaseReturns({ type: this.caseType, limitSize: this.rowLimit, offset: this.rowOffSet })
            .then(result => {
                //this.isLoadingSpinner = false;
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
                //alert('length'+this.records.length);
                this.error = undefined;
               
            })
            .catch(error => {
                this.error = error;
                this.records = undefined;
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
    handleBackToListView() {
        this.showReturnListViews = false;
        this.viewReturnListButtons = true;
    }
}