import { LightningElement, track, api } from 'lwc';
import getRecords from '@salesforce/apex/MarkForOrderController.getVisits';
import { FlowNavigationBackEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';

const DELAY = 300;
export default class MarkForOrderVisit extends LightningElement {
    @api availableActions = [];
    @api accountId = '';
    @api value;
    @api visitId;
    @api popupHeader;
    @api popupMessage;
    @track data = [];
    showPopup = false;
    totalRecords;
    rowLimit = 5;
    rowOffSet = 0;
    error;
    isLoading;
    fieldValue;
    queryTerm = '';

    async handleKeyChange(event) {
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        this.delayTimeout = setTimeout(() => {
            this.queryTerm = searchKey;
            this.handleSearch();
        }, DELAY);
    }

    connectedCallback() {
        try {
            this.handleSearch();
        } catch (error) {
            throw error(error.getMessage());
        }
    }

    async handleSearch() {
        this.totalRecords = 0;
        this.isLoading = true;
        this.rowLimit = 5;
        this.rowOffSet = 0;
        await this.loadData([]).then(() => {
            this.isLoading = false;
        });
    }

    loadData(data) {
        return getRecords({
            queryTerm: this.queryTerm,
            accountId: this.accountId,
            limitSize: this.rowLimit,
            offset: this.rowOffSet
        })
            .then(result => {
                let newData = result.records.map(row => {
                    let startDateTime = row.PlannedVisitStartTime ? new Date(row.PlannedVisitStartTime) : undefined;
                    let EndDateTime = row.PlannedVisitEndTime ? new Date(row.PlannedVisitEndTime) : undefined;
                    return {
                        ...row,
                        ContactName: row?.Contact?.Name,
                        AccountName: row?.Account?.Name,
                        VisitTypeName: row?.VisitType?.Name,
                        LocationName: row?.Location?.Name,
                        VisitStartDate: startDateTime ? startDateTime?.toLocaleDateString() : '',
                        VisitEndDate: EndDateTime ? EndDateTime?.toLocaleDateString() : '',
                        VisitStartTime: startDateTime ? startDateTime?.toLocaleTimeString(('en-US'), { hour: '2-digit', minute: '2-digit' }) : '',
                        VisitEndTIme: EndDateTime ? EndDateTime?.toLocaleTimeString(('en-US'), { hour: '2-digit', minute: '2-digit' }) : '',
                        checked: row.Id == this.visitId ? true : false
                    }
                })
                this.data = [...data, ...newData];
                this.totalRecords = result.totalRecords;
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
            });
    }

    handleRadioChange(event) {
        this.visitId = event.target.dataset.value;
    }

    get loadMoreButton() {
        return this.totalRecords > (this.data && this.data.length);
    }

    loadMore(event) {
        const { target } = event;
        target.isLoading = true;
        this.rowOffSet = this.rowOffSet + this.rowLimit;
        this.loadData(this.data)
            .then(() => {
                target.isLoading = false;
            });
    }

    closeModal() {
        this.showPopup = false;
    }

    handleNext() {
        this.showPopup = true;
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
}