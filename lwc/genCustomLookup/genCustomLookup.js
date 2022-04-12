import { LightningElement, api } from 'lwc';

export default class GenCustomLookup extends LightningElement {
    //Name where Lookup is present
    @api objectApiName;
    //Lookup Field Name
    @api fieldApiName;
    //Label for Lookup 
    @api fieldLabel;
    //Selected value of the lookup
    @api value;
    @api index;
    @api label;
    @api disabled = false;
    @api required = false;

    // Handle the selected lookup value
    handleChange(event) {
        const selectedEvent = new CustomEvent('selected', {
            detail: {
                value: event.detail.value,
                source: this.fieldLabel,
                label: this.label,
                index: this.index
            }
        });
        this.dispatchEvent(selectedEvent);
    }
}