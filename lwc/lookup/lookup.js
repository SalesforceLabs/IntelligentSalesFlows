import { LightningElement, api, wire } from 'lwc';
import fetchLookupData from '@salesforce/apex/LookupController.fetchLookupData';
import fetchDefaultRecord from '@salesforce/apex/LookupController.fetchDefaultRecord';

const DELAY = 300;

export default class Lookup extends LightningElement {
    // public properties with initial default values 
    @api label = '';
    @api placeholder = 'search...';
    @api iconName = '';
    @api sObjectApiName = '';
    @api defaultRecordId = '';
    @api required;
    @api recordId;
    @api recordName;
    @api accountRecordId = '';
    // private properties 
    lstResult = []; // to store list of returned records   
    hasRecords = true;
    searchKey = ''; // to store input field value    
    isSearchLoading = false; // to control loading spinner  
    delayTimeout;
    selectedRecord = {}; // to store selected lookup record in object formate 
    // initial function to populate default selected lookup record if defaultRecordId provided  
    @api index;
    @api name;


    @wire(fetchDefaultRecord, { recordId: '$defaultRecordId', sObjectApiName: '$sObjectApiName' })
    wireDefaultRecord(value) {
        const { data, error } = value; // destructure the provisioned value
        this.isSearchLoading = false;
        if (data) {
            this.selectedRecord = data;
            this.lookupUpdatehandler(this.selectedRecord);
            this.handelSelectRecordHelper();
        }
        else if (error) {
            this.error = error;
            this.selectedRecord = {};
        }
    };

    // wire function property to fetch search record based on user input
    @wire(fetchLookupData, { searchKey: '$searchKey', sObjectApiName: '$sObjectApiName', accountId: '$accountRecordId' })
    searchResult(value) {
        const { data, error } = value; // destructure the provisioned value
        this.isSearchLoading = false;
        if (data) {
            this.hasRecords = data.length == 0 ? false : true;
            this.lstResult = JSON.parse(JSON.stringify(data));
        }
        else if (error) {
            this.isSearchLoading = false;
        }
    };

    // update searchKey property on input field change  
    handleKeyChange(event) {
        const lookupInputContainer = this.template.querySelector('.lookupInputContainer');
        lookupInputContainer.removeAttribute('required');
        // Debouncing this method: Do not update the reactive property as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
        this.isSearchLoading = true;
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        this.delayTimeout = setTimeout(() => {
            if (searchKey.length >= 2)
                this.searchKey = searchKey;
        }, DELAY);
    }

    // method to toggle lookup result section on UI 
    toggleResult(event) {
        //event.currentTarget.reportValidity();
        const lookupInputContainer = this.template.querySelector('.lookupInputContainer');
        const clsList = lookupInputContainer.classList;
        lookupInputContainer.removeAttribute('required');
        const whichEvent = event.target.getAttribute('data-source');
        switch (whichEvent) {
            case 'searchInputField':
                clsList.add('slds-is-open');
                break;
            case 'lookupContainer':
                clsList.remove('slds-is-open');
                break;
        }
    }

    // method to clear selected lookup record  
    @api handleRemove() {
        this.searchKey = '';
        this.selectedRecord = {};
        this.lookupUpdatehandler(null); // update value on parent component as well from helper function 

        // remove selected pill and display input field again 
        const searchBoxWrapper = this.template.querySelector('.searchBoxWrapper');
        searchBoxWrapper.classList.remove('slds-hide');
        searchBoxWrapper.classList.add('slds-show');
        const pillDiv = this.template.querySelector('.pillDiv');
        pillDiv.classList.remove('slds-show');
        pillDiv.classList.add('slds-hide');
    }
    // method to update selected record from search result 
    handelSelectedRecord(event) {
        var objId = event.target.getAttribute('data-recid'); // get selected record Id 
        this.selectedRecord = this.lstResult.find(data => data.Id === objId); // find selected record from list 
        this.recordId = this.selectedRecord.Id;
        this.recordName = this.selectedRecord.Name;
        this.lookupUpdatehandler(this.selectedRecord); // update value on parent component as well from helper function 
        this.handelSelectRecordHelper(); // helper function to show/hide lookup result container on UI
    }
    /*COMMON HELPER METHOD STARTED*/
    handelSelectRecordHelper() {
        this.template.querySelector('.lookupInputContainer').classList.remove('slds-is-open');
        const searchBoxWrapper = this.template.querySelector('.searchBoxWrapper');
        searchBoxWrapper.classList.remove('slds-show');
        searchBoxWrapper.classList.add('slds-hide');
        const pillDiv = this.template.querySelector('.pillDiv');
        pillDiv.classList.remove('slds-hide');
        pillDiv.classList.add('slds-show');
    }
    // send selected lookup record to parent component using custom event
    lookupUpdatehandler(value) {
        const oEvent = new CustomEvent('lookupupdate',
            {
                'detail': {
                    selectedRecord: value,
                    sObjectApiName: this.sObjectApiName,
                    index: this.index,
                    name: this.name
                }
            }
        );
        this.dispatchEvent(oEvent);
    }
}