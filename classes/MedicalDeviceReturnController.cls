public with sharing class MedicalDeviceReturnController {

    /*
    Method: getInventoryLocations
    Developer : Abdul(PWC)
    Date: 07/03/2022
    Description: This Method is used to get the all the inventory locations in the system
    */    
    @AuraEnabled(cacheable=true)
    public static List<Schema.Location> getInventoryLocations(String productId){
        Set<Id> locationIdSet = new Set<Id>();
        List<Schema.Location> locationList = new List<Schema.Location>();
        List<ProductItem> prodItemList = [SELECT Id,LocationId,Product2Id FROM ProductItem WHERE Product2Id=:productId];
        for(ProductItem prodItem : prodItemList){
            locationIdSet.add(prodItem.LocationId);
        }
        if(!locationIdSet.isEmpty()){
            locationList = [SELECT Id, Name, LocationType, OwnerId, IsInventoryLocation FROM Location WHERE IsInventoryLocation=true AND Id IN:locationIdSet];
        }
        return locationList;
    } 
    
    /*
    Method: fetchSerilizedProductsforReturn
    Developer : Abdul(PWC)
    Date: 07/03/2022
    Description: This Method is used to get the serialized products lists for Return 
	related to the account
    */    
    @AuraEnabled(cacheable=true)
    public static List<String> fetchSerilizedProductsforReturn(String productId){
        List<string> allSerilizedProductsList = new List<String>();
        for(SerializedProduct sp: [SELECT Id, ProductItemId, Product2Id, Status,SerialNumber   FROM SerializedProduct WHERE Status='Sent' AND ProductItemId ='' AND Product2Id =: productId]){
            allSerilizedProductsList.add(sp.SerialNumber);
        }
                System.debug('-->Ser'+allSerilizedProductsList);
        return allSerilizedProductsList;
    }
      
    @AuraEnabled
    public static List<Case> fetchCaseReturns(String type, Integer limitSize, Integer offset){
        return [SELECT Id,CaseNumber,Account.Name,AccountId, ContactId ,Status,Type,Subject,ProductId,Product.Name,Location__r.Name,Location__c,Requested_Date__c,Quantity__c, From_Date__c ,To_Date__c, Contact.Name  FROM Case WHERE Status='New' And Type=:type ORDER BY Account.Name DESC LIMIT:limitSize OFFSET:offset];
    }
    
    @AuraEnabled
    public static List<GnrcVstKeyPerformanceInd> getKPIQueries(String productId){
        System.debug('-->productId'+productId);
        return [SELECT Id,SequenceNumber , AssessmentIndDefinitionId, AssessmentIndDefinition.Name, AssessmentIndDefinition.DataType, VisitTaskContext.ContextId,VisitTaskContextId,IsDefinition  FROM GnrcVstKeyPerformanceInd WHERE IsDefinition=true AND SerialNumber__c =null AND VisitTaskContext.ContextId=:productId];
    }
    
    @AuraEnabled(cacheable=true)
    public static Date getTodaysDate(){
		Date todaysDate = System.today();
        return todaysDate;
    }
}