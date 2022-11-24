import { LightningElement, track, wire, api } from 'lwc';
import getRelatedAccountLocations from '@salesforce/apex/MedicalDeviceRequestController.getRelatedAccountLocations';
import { FlowNavigationNextEvent, FlowNavigationBackEvent } from 'lightning/flowSupport';

export default class RelatedPicklistOptions extends LightningElement {
    @api availableActions = [];
    @api accountId;
    @api contactId;
    @api locationId;
    @api accountName = '';
    @api contactName;
    @api locationName;
    @api providerfieldLabel;
    @api accountFieldname;
    @api iconName;
    @api objectApiName;
    @api fieldLabel;
    @api placeHolder;
    @api recordIdValue;
    @api recordNameValue;
    @api contactIconName;
    @api contactObjectApiName;
    @api contactPlaceHolder;
    @api contactRecordIdValue;
    @api contactRecordNameValue;
    @api cancelFlow = false;
    @api accountFieldLabel;
    @api contactFieldLabel;
    @track relatedContactOptions;
    @track relatedLocationOptions;
    @track contactList;
    @track LocationList;

    @wire(getRelatedAccountLocations, { accId: '$accountId' }) wiredrelatedLocation({ data, error }) {
    //@wire(getRelatedFulfillmentLocations) wiredrelatedLocation({ data, error }) {
        let options = [];
        options.push({ label: '--None--', value: '' });
        if (data) {
            this.LocationList = data;
            for (var i = 0; i < this.LocationList.length; i++) {
                options.push({ label: this.LocationList[i].Name, value: this.LocationList[i].Id });
            }
        } else if (error) {
            options.push({ label: '--None--', value: '' });
        }
        this.relatedLocationOptions = options;
    }


    handleLocationsChange(event) {
        this.locationId = event.detail.value;
        this.locationName = event.target.options.find(opt => opt.value === event.detail.value).label;
    }

    lookupRecord(event) {
        const target = event.detail;
        if (target?.sObjectApiName == 'Account' && target.selectedRecord == null) {
            this.template.querySelector("[data-target-id='" + 'contact' + "']").handleRemove();
            this.relatedLocationOptions = [];
            this.relatedLocationOptions.push({ label: '--None--', value: '' });
        }
        if (target?.sObjectApiName == 'Account') {
            this.accountId = target?.selectedRecord?.Id;
            this.accountName = target?.selectedRecord?.Name;
        } else if (target?.sObjectApiName == 'Contact') {
            this.contactId = target?.selectedRecord?.Id;
            this.contactName = target?.selectedRecord?.Name;
        }
    }

    handleGoNext() {
        this.template.querySelectorAll('lightning-combobox').forEach(element => {
            element.reportValidity();
        });
        if (this.contactId && this.accountId && this.locationId) {
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
        if (this.availableActions.find((action) => action === 'NEXT')) {
            // navigate to the next screen
            const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
        }
    }

}