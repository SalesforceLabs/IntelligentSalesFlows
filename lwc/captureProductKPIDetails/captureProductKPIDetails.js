import { LightningElement, track, api, wire } from 'lwc';
import { FlowNavigationNextEvent, FlowNavigationBackEvent } from 'lightning/flowSupport';
import getSerilizedProducts from '@salesforce/apex/MedicalDeviceReturnController.fetchSerilizedProductsforReturn';
import getSerializedProductsInTheCase from '@salesforce/apex/MedicalDeviceReturnController.getSerializedProductsInTheCase';
import getKPIQueries from '@salesforce/apex/MedicalDeviceReturnController.getKPIQueries';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
const now = new Date();
import DATE_FIELD from '@salesforce/schema/Case.Requested_Date__c';
import QTY_FIELD from '@salesforce/schema/Case.Quantity__c';
import QTY_HANDEDOVER from '@salesforce/schema/Case.Quantity_Handedover__c';
import ACCOUNT_FIELD from '@salesforce/schema/Case.Account.Name';
import ACCOUNT_ID from '@salesforce/schema/Case.AccountId';
import CONTACT_ID from '@salesforce/schema/Case.ContactId';
import PRODUCT_ID from '@salesforce/schema/Case.ProductId';
import PRODUCT_NAME from '@salesforce/schema/Case.Product.Name';
import LOCATION_ID from '@salesforce/schema/Case.Location__c';
import CONTACT_FIELD from '@salesforce/schema/Case.Contact.Name';
import LOCATION_FIELD from '@salesforce/schema/Case.Location__r.Name';
import PRODUCT_FIELD from '@salesforce/schema/Case.Product.Name';
import FROMDATE_FIELD from '@salesforce/schema/Case.From_Date__c';
import TODATE_FIELD from '@salesforce/schema/Case.To_Date__c';
import RETURN_QUANTITY from '@salesforce/schema/Case.Quantity_Returned__c';
import PARENT_CASE_ID from '@salesforce/schema/Case.ParentId';

export default class CaptureProductKPIDetails extends NavigationMixin(LightningElement) {
    @api caseId;
    @api productQuantity;
    @api availableActions = [];
    @api isSerialNumbersExist;
    @api serializedProductsList = [];
    @api kPIQueriesSobjectList =[];
    @api kPIQueriesGVKPIObjectList=[];
    @api kPIQueriesList =[];
    @api locationlabel;
    @api accountlabel;
    @api contactlabel;
    @api quantitylabel;
    @api datelabel;
    @api returningLocation;
    @api returningLocationId;
    @api returningDate;
    @api flowType;
    @track isLoaded = false;
    @track productId;
    @track productName;
    @track responseValue;
    @track showButton = true;
    @track returnQuantityOnCase;
    @track quantityHandedOver;
    @track remainingReturnQuantity;
    @track newrows = [];
    @track newRecords = [];
    @track rows = [];
    @track itemList = [];
    @track allSerlializedProducts =[];
    @track serializedProductsToBeReturned =[];
    @track isNextDisabled= true;


    keyIndex = 1;
    error;
    caseDetail;
    caseRecord;


    @wire(getRecord, { recordId: '$caseId', fields: [PRODUCT_ID, PRODUCT_NAME, ACCOUNT_FIELD, CONTACT_FIELD, QTY_FIELD, QTY_HANDEDOVER,
        LOCATION_FIELD, PRODUCT_FIELD, ACCOUNT_ID, CONTACT_ID, LOCATION_ID, DATE_FIELD, FROMDATE_FIELD, TODATE_FIELD, PARENT_CASE_ID, RETURN_QUANTITY] })
    wireCase({ data, error }) {
        if (data) {
            this.isLoaded = true;
            this.caseRecord = data;
            this.caseDetail = {};
            this.productId = getFieldValue(data, PRODUCT_ID);
            this.productName = getFieldValue(data, PRODUCT_NAME);
            this.caseDetail['Account'] = getFieldValue(data, ACCOUNT_FIELD);
            this.caseDetail['Contact'] = getFieldValue(data, CONTACT_FIELD);
            this.caseDetail['Quantity'] = getFieldValue(data, QTY_FIELD);
            this.caseDetail['QantityHandedover'] = getFieldValue(data, QTY_HANDEDOVER);
            this.caseDetail['Location'] = getFieldValue(data, LOCATION_FIELD);
            this.caseDetail['Product'] = getFieldValue(data, PRODUCT_FIELD);
            this.caseDetail['AccountId'] = getFieldValue(data, ACCOUNT_ID);
            this.caseDetail['ContactId'] = getFieldValue(data, CONTACT_ID);
            this.caseDetail['LocationId'] = getFieldValue(data, LOCATION_ID);
            this.caseDetail['ProductId'] = getFieldValue(data, PRODUCT_ID);
            let requestedDate = new Date(getFieldValue(data, DATE_FIELD));
            let StartDate = new Date(getFieldValue(data, FROMDATE_FIELD));
            let EndDate = new Date(getFieldValue(data, TODATE_FIELD));
            this.caseDetail['Date'] = requestedDate?.toLocaleDateString();
            this.caseDetail['StartDate'] = StartDate?.toLocaleDateString();
            this.caseDetail['EndDate'] = EndDate?.toLocaleDateString();
            this.caseDetail['ParentId'] = getFieldValue(data, PARENT_CASE_ID);
            let quantHandedover = getFieldValue(data, QTY_HANDEDOVER);
            this.quantityHandedOver = quantHandedover==null?0:quantHandedover;
            let returnQuantityOnCase = getFieldValue(data, RETURN_QUANTITY);
            this.returnQuantityOnCase = returnQuantityOnCase==null?0:returnQuantityOnCase;
            this.remainingReturnQuantity = quantHandedover-returnQuantityOnCase;
            this.getKPIQueries();
        }else{
            this.isLoaded = false;
        }
    }

    @wire(getSerilizedProducts, { productId: '$caseDetail.ProductId' })
    wiredSerilizedProducts({ data, error }) {
        if (data) {
            this.allSerlializedProducts = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            console.error(error);
        }
    }

    @wire(getSerializedProductsInTheCase, { caseId: '$caseDetail.ParentId', productId: '$caseDetail.ProductId' })
    wiredGenericCaseKpi({ data, error }) {
        if (data) {
            this.serializedProductsToBeReturned = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            console.error(error);
        }
    }

    connectedCallback() {
        let dateval = new Date(this.returningDate);
        this.returningDate = dateval?.toLocaleDateString();
        if(this.productQuantity == 1){
            this.showButton = false;
        }
    }

    getKPIQueries() {
        return getKPIQueries({ productId: this.productId })
            .then(result => {
                let records = [];
                let newRecords = result.map(row => {
                    return {
                        ...row,
                        QuestionLabel: row.AssessmentIndDefinitionId != undefined ? row.AssessmentIndDefinition.Name : '',
                        DataTypeLabel: row.AssessmentIndDefinitionId != undefined ? row.AssessmentIndDefinition.DataType == 'Boolean' ? 'Checkbox' : row.AssessmentIndDefinition.DataType : ''
                    }
                })
                records = records.concat(newRecords);
                if (records.length) {
                    for (let i = 0; i < records.length; i++) {
                        this.rows.push({
                            SerialNumber__c: '',
                            Assessment_Indicator_Definition__c:records[i].AssessmentIndDefinitionId,
                            Case__c:this.caseId,
                            Product__c:this.productId,
                            Question__c: records[i].QuestionLabel,
                            DataType__c: records[i].DataTypeLabel,
                            Response__c: records[i].DataTypeLabel =='Checkbox'?false:records[i].DataTypeLabel =='Number'?0:'',
                            summaryResponse: records[i].DataTypeLabel =='Checkbox'?'No':records[i].DataTypeLabel =='Number'?0:'',
                            Type__c:this.flowType,
                            ActualBooleanValue__c: false,
                            ActualIntegerValue__c: 0,
                            ActualStringValue__c:'',
                            ActualDecimalValue__c:0,
                            ActualDateTimeValue__c:'',
                            IsDefinition: false,
                            VisitTaskContextId: records[i].VisitTaskContextId,
                            AssessmentIndDefinitionId: records[i].AssessmentIndDefinitionId,
                            ActualBooleanValue: 'False',
                            ActualIntegerValue: 0,
                            ActualStringValue: '',
                            ActualDateTimeValue:'',
                            ActualDecimalValue:0
                        });
                    }
                }
                this.newrows = this.rows;
                this.itemList.push({
                    serialNumber: '',
                    kPIQueries: this.rows
                });
            })
            .catch(error => {
                this.error = error;
                this.records = undefined;
            });
    }

    handleButton() {
        this.keyIndex = this.keyIndex+1;
        if(this.keyIndex == this.productQuantity){
            this.showButton = false;
        }
        let newRecords = [];
        newRecords = this.newrows.map(row => {
            return {
                SerialNumber__c: '',
                Assessment_Indicator_Definition__c:row.Assessment_Indicator_Definition__c,
                Case__c:row.Case__c,
                Product__c:row.Product__c,
                Question__c: row.Question__c,
                DataType__c: row.DataType__c,
                Response__c: row.DataType__c =='Checkbox'?false:row.DataType__c =='Number'?0:'',
                summaryResponse: row.DataType__c =='Checkbox'?'No':row.DataType__c =='Number'?0:'',
                Type__c:this.flowType,
                ActualBooleanValue__c: false,
                ActualIntegerValue__c: 0,
                ActualStringValue__c:'',
                ActualDecimalValue__c:0,
                ActualDateTimeValue__c:'',
                IsDefinition: false,
                VisitTaskContextId: row.VisitTaskContextId,
                AssessmentIndDefinitionId: row.Assessment_Indicator_Definition__c,
                ActualBooleanValue: 'False',
                ActualIntegerValue: 0,
                ActualStringValue: '',
                ActualDateTimeValue:'',
                ActualDecimalValue:0
            }
        })
        var newItem = [{  serialNumber: '', kPIQueries: newRecords }];
        this.itemList = this.itemList.concat(newItem);
    }

    handleSelected(event) {
        let index = event.target.dataset.index;
        let enteredValue = this.template.querySelector("[data-target-id='" + index + "']");
        let enteredSerialNumber = enteredValue.value;
         if (enteredSerialNumber && this.serializedProductsToBeReturned.length == 0)
            enteredValue.setCustomValidity('No Serialized Products found for the selected Product.');
        else if (enteredSerialNumber && !this.serializedProductsToBeReturned.includes(enteredSerialNumber))
            enteredValue.setCustomValidity('Enter a valid serial number.');
        else if (enteredSerialNumber && this.itemList.length > 1 && this.itemList.find(e => e.serialNumber == enteredSerialNumber))
            enteredValue.setCustomValidity('Duplicate Serial Number Entered');
        else
            enteredValue.setCustomValidity('');

        enteredValue.reportValidity();

        if(this.serializedProductsToBeReturned.includes(enteredSerialNumber)){
            this.itemList[event.target.dataset.index].serialNumber = enteredSerialNumber;
        }
         let rowsize = this.newrows.length;
         for(let i=0;i<rowsize;i++){
            this.itemList[event.target.dataset.index].kPIQueries[i].SerialNumber__c = enteredSerialNumber;
         }
         let arr =[];
         arr = this.itemList.map(row => row.serialNumber).filter(v=>v!='');
         if(arr.length == this.productQuantity){
             this.isNextDisabled = false;
         }else{
            this.isNextDisabled = true;
         }
    }

    handleChildSelected(event) {
        let index = event.target.dataset.index;
        let rowindex = event.target.dataset.childindex;
        if(this.itemList[index].kPIQueries[rowindex].DataType__c == 'Checkbox'){
            this.itemList[index].kPIQueries[rowindex].ActualBooleanValue__c = event.target.checked;
            this.itemList[index].kPIQueries[rowindex].ActualBooleanValue = event.target.checked ? 'True':'False';
            this.itemList[index].kPIQueries[rowindex].Response__c = event.target.checked;
            this.itemList[index].kPIQueries[rowindex].summaryResponse = event.target.checked?'Yes':'No';       
        }else if(this.itemList[index].kPIQueries[rowindex].DataType__c == 'Number'){
            this.itemList[index].kPIQueries[rowindex].ActualIntegerValue__c = event.target.value;
            this.itemList[index].kPIQueries[rowindex].ActualIntegerValue = event.target.value;
            this.itemList[index].kPIQueries[rowindex].Response__c = event.target.value;
            this.itemList[index].kPIQueries[rowindex].summaryResponse = event.target.value;       
        }else if(this.itemList[index].kPIQueries[rowindex].DataType__c == 'Date Time'){
            this.itemList[index].kPIQueries[rowindex].ActualDateTimeValue__c = event.target.value;
            this.itemList[index].kPIQueries[rowindex].ActualDateTimeValue = event.target.value;
            this.itemList[index].kPIQueries[rowindex].Response__c = event.target.value;
            this.itemList[index].kPIQueries[rowindex].summaryResponse = event.target.value;       
        }
        else if(this.itemList[index].kPIQueries[rowindex].DataType__c == 'Decimal'){
            this.itemList[index].kPIQueries[rowindex].ActualDecimalValue__c = event.target.value;
            this.itemList[index].kPIQueries[rowindex].ActualDecimalValue = event.target.value;
            this.itemList[index].kPIQueries[rowindex].Response__c = event.target.value;
            this.itemList[index].kPIQueries[rowindex].summaryResponse = event.target.value;       
        }
        else if(this.itemList[index].kPIQueries[rowindex].DataType__c == 'Percentage'){
            this.itemList[index].kPIQueries[rowindex].ActualIntegerValue = event.target.value;
            this.itemList[index].kPIQueries[rowindex].ActualIntegerValue__c = event.target.value;
            this.itemList[index].kPIQueries[rowindex].Response__c = event.target.value;
            this.itemList[index].kPIQueries[rowindex].summaryResponse = event.target.value;       
        }
        else{
            this.itemList[index].kPIQueries[rowindex].Response__c = event.target.value;
            this.itemList[index].kPIQueries[rowindex].summaryResponse = event.target.value;
            this.itemList[index].kPIQueries[rowindex].ActualStringValue__c = event.target.value;
            this.itemList[index].kPIQueries[rowindex].ActualStringValue = event.target.value;
        }
    }


    handleUrl(event) {
        const recordId = event.target.dataset.id;
        const objectApiName = event.target.dataset.name;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: objectApiName,
                actionName: 'view'
            }
        });
    }
    handleGoNext() {
        if(this.isInputValid()){
        this.serializedProductsList= this.itemList.map(row => row.serialNumber);
        this.kPIQueriesSobjectList = this.itemList.map(row => row.kPIQueries).flat();
        this.kPIQueriesGVKPIObjectList = this.itemList.map(row => row.kPIQueries).flat();
        this.isSerialNumbersExist = true;
        }

    }
    handleGoBack() {
        if (this.availableActions.find((action) => action === 'BACK')) {
            // navigate to the next screen
            const navigateBackEvent = new FlowNavigationBackEvent();
            this.dispatchEvent(navigateBackEvent);
        }
    }
    handleGoBackSerialNumbers() {
            this.isSerialNumbersExist = false;
    }
    handleGoNextSerialNumbers() {
        // check if NEXT is allowed on this screen
        if (this.availableActions.find((action) => action === 'NEXT')) {
            // navigate to the next screen
            const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
        }
    }
    isInputValid() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.validate');
        inputFields.forEach(inputField => {
            if (!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    }
}