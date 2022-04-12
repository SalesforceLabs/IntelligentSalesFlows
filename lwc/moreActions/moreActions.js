import { LightningElement } from 'lwc';

export default class MoreActions extends LightningElement {
    get Options() {
        return [
            { id: 'Mark_Product_for_Order', iconName: 'action:preview', label: 'Mark for Order' },
            { id: 'Mark_For_Lost', iconName: 'action:new_note', label: 'Mark as Transferred Out' },
            { id: 'Mark_For_Lost', iconName: 'action:goal', label: 'Mark for Lost' }]
    }

    launchFlow(event) {
        event.preventDefault();
        const flowDetails = { 'flowName': event.target.dataset.id };
        const filterChangeEvent = new CustomEvent('invokeflow', {
            detail: { flowDetails },
        });
        this.dispatchEvent(filterChangeEvent);
    }
}