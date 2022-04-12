import { LightningElement, track, wire, api } from 'lwc';
import getRelatedContacts from '@salesforce/apex/PicklistOptionsController.getRelatedContacts';
import getRelatedFulfillmentLocations from '@salesforce/apex/PicklistOptionsController.getRelatedFulfillmentLocations';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';

export default class RelatedPicklistOptions extends LightningElement {
    @api accountId;
    @api contactId;
    @api locationId;
    @api accountName = '';
    @api contactName;
    @api locationName;
    @api providerfieldLabel;
    @api accountFieldname;
    @track relatedContactOptions;
    @track relatedLocationOptions;
    @track contactList;
    @track LocationList;

    @api accountFieldLabel = 'Select Hospital Account Requesting Sample';
    @api contactFieldLabel = 'Select Doctor/Provider';
     @wire(getRelatedContacts, { accId: '$accountId' }) wiredOpps({ data, error }) {
        let options = [];
        options.push({ label: '--None--', value: '' });
        if (data) {
            this.contactList = data;
            for (var i = 0; i < this.contactList.length; i++) {
                options.push({ label: this.contactList[i].Name, value: this.contactList[i].Id });
            }
            console.log(data);
        } else if (error) {
            console.log(error);
        }
        this.relatedContactOptions = options;
    }

    @wire(getRelatedFulfillmentLocations, { accId: '$accountId' }) wiredrelatedLocation({ data, error }) {
        let options = [];
        options.push({ label: '--None--', value: '' });
        if (data) {
            this.LocationList = data;
            for (var i = 0; i < this.LocationList.length; i++) {
                options.push({ label: this.LocationList[i].Name, value: this.LocationList[i].Id });
            }
            console.log(data);
        } else if (error) {
            console.log(error);
        }
        this.relatedLocationOptions = options;
    }

    handleContactsChange(event) {
        this.contactId = event.detail.value;
        this.contactName = event.target.options.find(opt => opt.value === event.detail.value).label;
    }

    handleLocationsChange(event) {
        this.locationId = event.detail.value;
        this.locationName = event.target.options.find(opt => opt.value === event.detail.value).label;
    }
    
    lookupRecord(event) {
        const target = event.detail;
        console.log(JSON.stringify(event.detail))
        if(target.sObjectApiName == 'Account'){
            this.accountId = target?.selectedRecord?.Id;
            this.accountName  = target?.selectedRecord?.Name;
        }else{
            this.contactId = target?.selectedRecord?.Id;
            this.contactName  = target?.selectedRecord?.Name;
        }
    }
}