import { LightningElement, api } from 'lwc';
import { FlowNavigationNextEvent, FlowNavigationBackEvent } from 'lightning/flowSupport';

export default class markSerialNumbers extends LightningElement {
    @api availableActions = [];
    @api SerializedProducts;
    @api selectedSerialNumberIds;
    @api title;
    @api terminate;
    @api selectedSerialNumbers = [];
    selectedValues = [];

    get serialNumbersCount() {
        return (this.options && this.options.length) || 0;
    }

    connectedCallback() {
        if (this.selectedSerialNumberIds) {
            this.selectedValues = this.selectedSerialNumberIds//this.value.split(';');
        }
    }

    get options() {
        let rows = [];
        if (this.SerializedProducts && this.SerializedProducts.length) {
            for (let x in this.SerializedProducts) {
                let row = { 'label': this.SerializedProducts[x]?.SerialNumber, 'value': this.SerializedProducts[x]?.Id }
                rows.push(row);
            }
        }
        return rows;
    }

    handleChange(e) {
        this.selectedValues = e.detail.value;
        this.selectedSerialNumberIds = e.detail.value;
        this.selectedSerialNumbers = this.SerializedProducts.filter(e => this.selectedValues.includes(e.Id)).map(e => e.SerialNumber);
    }

    @api
    validate() {
        if (!this.selectedSerialNumberIds && !this.terminate) {
            return {
                isValid: false,
                errorMessage: 'Select atleast one product.'
            };
        }
    }

    handleNext() {
        if (this.availableActions.find((action) => action === 'NEXT')) {
            // navigate to the next screen
            const navigatenNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigatenNextEvent);
        }
    }

    handleCancel() {
        this.terminate = true;
        const navigatenNextEvent = new FlowNavigationBackEvent();
            this.dispatchEvent(navigatenNextEvent);
        if (this.availableActions.find((action) => action === 'BACK')) {
            // navigate to the next screen
            const navigatenNextEvent = new FlowNavigationBackEvent();
            this.dispatchEvent(navigatenNextEvent);
        }
    }

}