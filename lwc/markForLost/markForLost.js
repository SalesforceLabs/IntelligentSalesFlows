import { api, LightningElement, track } from 'lwc';
import { FlowNavigationBackEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';

export default class MarkForLost extends LightningElement {
    @api selectedSerialNumbers;
    @api SerializedProducts;
    @track showPopupApp;
    @api popupBodyHeaderAssign;
    @api popupBodyAssign
    @api popUpHeader
    @api saveButtonLabel = 'Confirm';
    @api popupButtonLabel = 'Cancel';
    @api availableActions = [];
    rows = [];
    @api lostSerializedProducts = [];
    
    connectedCallback() {
        console.log('rows', this.rows);
        if (this.selectedSerialNumbers) {
            let SerializedProductsIds = this.selectedSerialNumbers.split(';').map(item => item.trim());
            const results = this.SerializedProducts.filter(row => SerializedProductsIds.includes(row.Id));
            for (let i = 0; i <= results.length; i++) {
                if (results[i]) {
                    let row = {
                        'Serialized_Product__c': results[i].Id,
                        'Serial_Number__c': results[i].SerialNumber,
                        'Date_of_Lost__c': '',
                        'Location_Of_Lost__c': '',
                        'User_Responsible_for_Loss__c': ''
                    }
                    this.rows.push(row);
                }
            }
            console.log('rows', this.rows);
        }
    }

    handleNext() {
        this.showPopupApp = true;
    }

    handleUpdate() {
        this.showPopupApp = false;
        console.log(this.rows);
        this.lostSerializedProducts = this.rows;
        if(this.isInputValid()){
            if (this.availableActions.find((action) => action === 'NEXT')) {
                // navigate to the next screen
                const navigateFinishEvent = new FlowNavigationNextEvent();
                this.dispatchEvent(navigateFinishEvent);
            }
        }
    }

    handleChange(event) {
        let date = event.target.value;
        let todaysDate = new Date();
            let id = event.target.dataset.id;
            let index = event.target.dataset.index;
            this.rows[index][id] = event.target.value;
        
        let enteredValue = this.template.querySelector("[data-target-id='" + index + "']");

        if (new Date(date).getTime() > todaysDate.getTime()) {
            enteredValue.setCustomValidity('The Date must be less than or Equal to today date');
        } else {
            enteredValue.setCustomValidity('');
        }
        enteredValue.reportValidity();
    
    }

    handleSelected(event) {
        let detail = event.detail;
        if (detail.value) {
            this.rows[detail.index][detail.label] = detail.value[0];
        }
    }

    handlePrevious() {
        if (this.availableActions.find((action) => action === 'BACK')) {
            // navigate to the next screen
            const navigateBackEvent = new FlowNavigationBackEvent();
            this.dispatchEvent(navigateBackEvent);
        }

    }

    closeModal() {
        this.showPopupApp = false;
    }

    isInputValid() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.dateField');
        inputFields.forEach(inputField => {
            if(!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    }
}