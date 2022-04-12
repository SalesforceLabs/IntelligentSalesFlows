import { LightningElement, api } from 'lwc';

export default class markSerialNumbers extends LightningElement {
    @api SerializedProducts;
    @api value;
    @api title;
    selectedValues = [];

    get selectedSerialNumbers() {
        return (this.selectedValues && this.selectedValues.length) || 0;
    }

    connectedCallback() {
        if (this.value) {
            this.selectedValues = this.value.split(';');
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
        this.value = e.detail.value.join(';');
    }

    @api
    validate() {
        if (!this.value) {
            return {
                isValid: false,
                errorMessage: 'Please select a choice.'
            };
        }
    }
}