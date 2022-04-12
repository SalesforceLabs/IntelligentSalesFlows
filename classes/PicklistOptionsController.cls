/********************************************************
Class Name: PicklistOptionsController
Developer : Abdul(PWC)
Date: 07/03/2022
Description: This Class is used to get the related records 
for the given account.
********************************************************/
public with sharing class PicklistOptionsController {
    /*
    Method: PicklistOptionsController
    Developer : Abdul(PWC)
    Date: 07/03/2022
    Description: This Method is used to get the record values of the contacts
	related to the account
    */
    @AuraEnabled(Cacheable=true)
    public static List<Contact> getRelatedContacts(String accId){
        return [SELECT Id, Name,AccountId FROM Contact WHERE AccountId =:accId];
    }
    /*
    Method: PicklistOptionsController
    Developer : Abdul(PWC)
    Date: 07/03/2022
    Description: This Method is used to get the record values of the Locations
	related to the account
    */    
    @AuraEnabled(Cacheable=true)
    public static List<Schema.Location> getRelatedFulfillmentLocations(String accId){
        Set<Id> locationSetId = new Set<Id>();
        List<Schema.Location> locaList = new List<Schema.Location>();
        for(ProductFulfillmentLocation prodFulLoc : [SELECT Id, Name,AccountId,FulfillmentLocationId  FROM ProductFulfillmentLocation WHERE AccountId =:accId]){
            locationSetId.add(prodFulLoc.FulfillmentLocationId); 
        }
        if(!locationSetId.isEmpty()){
            locaList =[Select Id,Name, IsInventoryLocation  FROM Location WHERE Id IN:locationSetId AND IsInventoryLocation=true ];
        }
         return locaList; 
    }

}