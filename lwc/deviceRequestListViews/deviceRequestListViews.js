import { LightningElement,track } from 'lwc';

export default class DeviceRequestListViews extends LightningElement {
    @track showListViewButtons = true;

    handleClick(){
 alert('-Clickable');
    }
}