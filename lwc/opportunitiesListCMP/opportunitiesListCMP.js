import { LightningElement, track, wire, api} from 'lwc';
import fetchopportunities from '@salesforce/apex/MedicalDeviceRequestController.fetchRelatedOpps';
import { FlowNavigationNextEvent } from 'lightning/flowSupport';
import { FlowNavigationBackEvent } from 'lightning/flowSupport';


export default class OpportunitiesListCMP extends LightningElement {
@api accountId;
@api fieldValue;
@api availableActions = [];
@api value; 
@api hideFooterButtons = false;
@track oppList =[];
@track rowLimit =4;
@track rowOffSet=0;
@track isLoadingData = true;
@track isExistingOpp = false;


   connectedCallback(){
     if(this.value == 'option1'){
      this.isExistingOpp = true;
     }else if(this.value == 'option2'){
      this.isExistingOpp = false;
      }

     this.loadData();
   }

  fetchAllSerializedProducts(){
    return fetchopportunities({ accId: this.accountId, limitSize: this.rowLimit , offset : this.rowOffSet })
    .then(result => {
    })
    .catch(error => {
        alert('Error'+JSON.stringify(error));
        this.error = error;
        this.oppList = undefined;
    });
  }
  loadData(){
     return fetchopportunities({ accId: this.accountId, limitSize: this.rowLimit , offset : this.rowOffSet })
       .then(result => {
        if(result.length ==0){
          this.isLoadingData = false;
      }else if(result.length >2){
          this.isLoadingData = true;
      }else{
          this.isLoadingData = false;
      }
           let updatedRecords = [...this.oppList, ...result];
           updatedRecords = updatedRecords.map(row => {
            return { ...row, AccountName: row.Account.Name }
           })
           this.oppList = updatedRecords;
           this.error = undefined;
       })
       .catch(error => {
           alert('Error'+JSON.stringify(error));
           this.error = error;
           this.oppList = undefined;
       });
   }

   get options() {
       return [
           { label: 'Existing Opportunity', value: 'option1' },
           { label: 'New Opportunity', value: 'option2' },
       ];
   }
   handleNextButton(){
      if (this.availableActions.find((action) => action === 'NEXT')) {
      // navigate to the next screen
      const navigateNextEvent = new FlowNavigationNextEvent();
      this.dispatchEvent(navigateNextEvent);
     }
   }
   handleBackButton(){
    if (this.availableActions.find((action) => action === 'BACK')) {
      // navigate to the next screen
      const navigateBackEvent = new FlowNavigationBackEvent();
      this.dispatchEvent(navigateBackEvent);
     }
   }
   
  handleLoadMore(event){
     const currentRecord = this.oppList;
     const { target } = event;
     target.isLoading = true;

     this.rowOffSet = this.rowOffSet + this.rowLimit;
     this.loadData()
          .then(()=> {
          target.isLoading = false;
          });  
     }

  toggleDoneButton(action) {
      if (!this.hideFooterButtons) {
          const doneButton = this.template.querySelector('button.done');
          if (action === 'enable') {
              doneButton.removeAttribute('disabled');
          } else {
              doneButton.setAttribute('disabled', 'true');
          }
      }
  }

     /*handleRadioGroup(event) {
      const selectedOption = event.detail.value;
      if(selectedOption == 'option1'){
        this.isExistingOpp = true;
        this.isNewOpp = false;
      }else if(selectedOption == 'option2'){
        this.isExistingOpp = false;
        this.isNewOpp = true;
      }
    }*/

   handleRadioChange(event) {
     const valueDet = event.target.dataset.value;
     if(valueDet != undefined ){
      this.toggleDoneButton('enable');
     }
     this.fieldValue = valueDet;
   }
 
}