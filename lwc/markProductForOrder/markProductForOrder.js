import { LightningElement, api, wire, track } from 'lwc';
import getRelatedFulfillmentLocations from '@salesforce/apex/MarkForOrderController.getRelatedFulfillmentLocations';
import getOrders from '@salesforce/apex/MarkForOrderController.getOrders';
import getSelectedOrder from '@salesforce/apex/MarkForOrderController.getOrderById';

import { FlowNavigationNextEvent, FlowNavigationBackEvent } from 'lightning/flowSupport';
const DELAY = 300;
const now = new Date(new Date().setDate(new Date().getDate()));
const pastDate = new Date(new Date().setDate(new Date().getDate() - 31));
export default class MarkProductForOrder extends LightningElement {
    @api availableActions = [];
    @api locationId;
    @api contactId;
    @api contactName;
    @api accountId;
    @api orderId;
    @api priceBookId;
    @api orderValue = 'existing';

    @track locations = [];
    @track data = [];

    totalRecords;
    rowLimit = 5;
    rowOffSet = 0;
    error;
    isLoading;
    queryTerm = '';

    fromDate = pastDate.toISOString().substring(0, 10);
    toDate = now.toISOString().substring(0, 10);
    today = now.toISOString().substring(0, 10);

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

    get options() {
        return [
            { label: 'New Order', value: 'new' },
            { label: 'Existing Order', value: 'existing' }
        ];
    }

    @wire(getRelatedFulfillmentLocations, { accId: '$accountId' }) wiredLocations({ data, error }) {
        if (data) {
            this.locations = data.map(row => {
                return { label: row.Name, value: row.Id }
            })
        } else if (error) {
            this.locations.push({ 'label': 'None', 'value': '' });
            console.error(error);
        }
    }

    connectedCallback() {
        this.handleSelectedOrder();
    }

    async handleSelectedOrder() {
        if (this.orderId) {
            this.isLoading = true;
            await getSelectedOrder({ orderId: this.orderId })
                .then(result => {
                    this.prepareData(result, []);
                }).catch(error => {
                    this.error = error;
                    this.data = undefined;
                });
            this.isLoading = false;
        }
    }

    get isNew() {
        return this.orderValue === 'new'
    }

    get isExisting() {
        return this.orderValue === 'existing'
    }

    get getNextButton() {
        return (this.orderValue === 'existing' && this.accountId) || (this.priceBookId && this.contactId && this.accountId) ? false : true;
    }

    handleChange(event) {
        if (event.target.dataset.label === 'location')
            this.locationId = event.detail.value;
        else if (event.target.dataset.label === 'radioGroup') {
            this.orderValue = event.detail.value;
            this.locationId = '';
            this.contactId = '';
            this.contactName = '';
            this.accountId = '';
            this.orderId = '';
            this.priceBookId = '';
        }
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

    loadData(data) {
        return getOrders({
            queryTerm: this.queryTerm,
            limitSize: this.rowLimit,
            offset: this.rowOffSet,
            fromDate: this.fromDate,
            toDate: this.toDate
        }).then(result => {
            this.totalRecords = result?.totalRecords;
            this.prepareData(result?.records, data);
        }).catch(error => {
            this.error = error;
            this.data = undefined;
        });
    }

    prepareData(result, data) {
        let newData = result.map(row => {
            return { ...row, AccountName: row.Account?.Name, checked: row.Id == this.orderId ? true : false }
        });
        this.data = [...data, ...newData];
        this.error = undefined;
    }

    get loadMoreButton() {
        return this.totalRecords > (this.data && this.data.length);
    }

    handleRadioChange(event) {
        this.orderId = event.target.dataset.value;
        this.accountId = event.target.dataset.id;
        this.priceBookId = this.data.filter(e => e.Id == this.orderId).map(e => e.Pricebook2Id);
    }

    handleGoNext() {
        // check if NEXT is allowed on this screen
        if (this.availableActions.find((action) => action === 'NEXT')) {
            // navigate to the next screen
            const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
        }
    }

    handleGoBack() {
        if (this.availableActions.find((action) => action === 'BACK')) {
            // navigate to the next screen
            const navigateBackEvent = new FlowNavigationBackEvent();
            this.dispatchEvent(navigateBackEvent);
        }
    }

    lookupRecord(event) {
        const target = event.detail;
        this[target.index] = target?.selectedRecord?.Id;
        this[target.name] = target?.selectedRecord?.Name;
        if (target?.sObjectApiName == 'Account' && target.selectedRecord == null) {
            this.template.querySelector("[data-target-id='" + 'contact' + "']").handleRemove();
        }
    }

    handleDate(event) {
        this[event.target.dataset.id] = event.detail.value;
    }

    handleClear() {
        this.fromDate = null;
        this.toDate = null;
    }

}