import { LightningElement, track, wire, api} from 'lwc';
import fetchSerilizedProducts from '@salesforce/apex/FetchRecordLists.fetchSerilizedProducts';



export default class OpportunitiesListCMP extends LightningElement {
@api accountId;
@api fieldValue;
@track oppList =[];
@track rowLimit =2;
@track rowOffSet=0;



   //Method 2
/*   @wire (fetchopportunities,{ accId: '$accountId'}) wiredOpps({data,error}){
        if (data) {
             this.oppList = data;
        console.log(data); 
        } else if (error) {
        console.log(error);
        }
   }*/
   connectedCallback(){
     this.loadData();
   }

   loadData(){
     return fetchSerilizedProducts()
       .then(result => {
           let updatedRecords = [...this.oppList, ...result];
           
           this.oppList = updatedRecords;
           this.error = undefined;
       })
       .catch(error => {
           alert('Error'+JSON.stringify(error));
           this.error = error;
           this.oppList = undefined;
       });
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

   handleRadioChange(event) {
     const valueDet = event.target.dataset.value;
     this.fieldValue = valueDet;
     //alert('selectedOption ' + valueDet);
   }
 
}