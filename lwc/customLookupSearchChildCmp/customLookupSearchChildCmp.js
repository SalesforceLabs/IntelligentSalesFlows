import { LightningElement,api } from 'lwc';

export default class CustomLookupSearchChildCmp extends LightningElement {
    @api iconName;
    @api objectApiName;
    @api fieldLabel;
    @api placeHolder;
    @api defaultRecordId;
    @api recordIdValue;
    @api recordNameValue;
  // handel custom lookup component event 
  lookupRecord(event){
    const target = event.detail;
        this.recordIdValue = target?.selectedRecord?.Id;
        this.recordNameValue = target?.selectedRecord?.Name;
    }

}