/********************************************************
Class Name: MedicalDeviceRequestController
Developer : Abdul(PWC)
Date: 07/03/2022
Description: This Class is used to get the related records 
for the given account.
********************************************************/
public with sharing class MedicalDeviceRequestController {
    /*
    Method: getRelatedFulfillmentLocations
    Developer : Abdul(PWC)
    Date: 07/03/2022
    Description: This Method is used to get the record values of the Locations
	related to the account
    */    
    @AuraEnabled(Cacheable=true)
    public static List<Schema.Location> getRelatedAccountLocations(String accId){
        Set<Id> locationSetId = new Set<Id>();
        List<Schema.Location> locaList = new List<Schema.Location>();
        for(ProductFulfillmentLocation prodFulLoc : [SELECT Id, Name,AccountId,FulfillmentLocationId,LocationId  FROM ProductFulfillmentLocation WHERE AccountId =:accId]){
            locationSetId.add(prodFulLoc.LocationId); 
        }
        if(!locationSetId.isEmpty()){
            locaList =[Select Id,Name, IsInventoryLocation  FROM Location WHERE Id IN:locationSetId AND IsInventoryLocation=true ];
        }
        return locaList; 
    }
    
    /*
    Method: fetchSerilizedProductsforHandover
    Developer : Anil(PWC)
    Date: 07/03/2022
    Description: This Method is used to get the serialized products lists for handover
	related to the account
    */    
    @AuraEnabled(cacheable=true)
    public static List<String> fetchSerilizedProductsforHandover(String productId, String locationId){
        List<string> allSerilizedProductsList = new List<String>();
        if (locationId == null || locationId == '' ) return allSerilizedProductsList;
        List<string> piList = new List<String>();
        for(ProductItem pi: [SELECT Id FROM ProductItem WHERE Product2Id =: productId AND LocationId =: locationId]){
            piList.add(pi.Id);
        }
        for(SerializedProduct sp: [SELECT Id, ProductItemId, Product2Id, Status,SerialNumber   FROM SerializedProduct WHERE Status='Available' AND ProductItemId IN :piList AND Product2Id =: productId]){
            allSerilizedProductsList.add(sp.SerialNumber);
        }
        return allSerilizedProductsList;
    }
    
     /*
    Method: getProductLocations
    Developer : Abdul(PWC)
    Date: 07/03/2022
    Description: This Method is used to get the record values of the Locations
	related to the account and products for Device Request handover flows
    */    
    @AuraEnabled(cacheable=true)
    public static List<Schema.Location> getProductLocations(string accountId, string productId){
        Set<Id> locationSetId = new Set<Id>();
        List<Schema.Location> locaList = new List<Schema.Location>();
        for(ProductFulfillmentLocation prodfulLoc : [SELECT Id, ProductId, Name, LocationId, Location.Name, FulfillmentLocationId, Account.Name FROM ProductFulfillmentLocation WHERE accountId=: accountId AND ProductId= :productId]){
            locationSetId.add(prodfulLoc.FulfillmentLocationId);
        }
        if(!locationSetId.isEmpty()){
            locaList =[Select Id,Name, IsInventoryLocation  FROM Location WHERE Id IN:locationSetId AND IsInventoryLocation=true ];
        }
        return locaList;
    } 
    /*
    Method: fetchRelatedOpps
    Developer : Abdul(PWC)
    Date: 07/03/2022
    Description: This Method is used to get the record values of the opportunities
    related to the account
    */
    @AuraEnabled
    public static List<Opportunity> fetchRelatedOpps(String accId,Integer limitSize, Integer offset){
        return [Select Id,Name,AccountId,Account.Name,Amount, CloseDate, StageName from opportunity WHERE AccountId=:accId ORDER BY CreatedDate LIMIT:limitSize OFFSET:offset];
    }
    
    /*
    Method: fetchCaseRequests
    Developer : Abdul(PWC)
    Date: 07/03/2022
    Description: This Method is used to get the record values of the request cases
    */
    @AuraEnabled
    public static List<Case> fetchCaseRequests(String status, String type, Integer limitSize, Integer offset){
        return [Select Id,CaseNumber,Account.Name,AccountId, ContactId ,Status,Type,Subject,ProductId,Product.Name,Location__r.Name,Location__c,Requested_Date__c,Quantity__c, From_Date__c ,To_Date__c, Contact.Name  FROM Case WHERE Status=:status AND Type=:type ORDER BY Account.Name DESC LIMIT:limitSize OFFSET:offset];
    }
    /*
    Method: fetchAllCaseRequests
    Developer : psahoo
    Date: 11/08/2022
    Description: This Method is used to get all the record values of the request cases
    */
    @AuraEnabled
    public static Map<String, Integer> fetchAllCaseRequests(String type){
        Integer approvedRecCount = [Select count() FROM Case WHERE Status='Approved' AND Type=:type];
        System.Debug('approvedRec = ' + approvedRecCount);
        Integer openRecCount = [Select count() FROM Case WHERE Status='In Review' AND Type=:type];
        return new Map<String, Integer> {
            'approvedRecCount' => approvedRecCount, 
            'openRecCount' => openRecCount
        };
    }

}