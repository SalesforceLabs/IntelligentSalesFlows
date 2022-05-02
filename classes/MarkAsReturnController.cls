public with sharing class MarkAsReturnController {
    @InvocableMethod(label='Update Product Return' description='Updates ProductItem location and Product Return.' category='SerializedProduct')
    public static List<Response> getRecordsForProductReturn(List<Requests> rqstInputs){
        try{
            //input varaibles from flow
            string prodcutId = rqstInputs[0]?.prodcutId;
            string locationId = rqstInputs[0]?.locationId;
            Date returnDate = rqstInputs[0]?.returnDate;
            List<string> serialNumbers = rqstInputs[0]?.serialNumbers;
            
            Map<String,String> prdtItemMap = new Map<String,String>();
            List<SerializedProduct> serilizedproductsList = new List<SerializedProduct>();
            if(string.isNotBlank(locationId) && String.isNotBlank(prodcutId)){
                for(ProductItem prdtItem: [SELECT Id,Product2Id ,LocationId FROM ProductItem where Product2Id =:prodcutId AND LocationId=:locationId ]){
                    prdtItemMap.put(prdtItem.Product2Id,prdtItem.Id);
                }
            }
            
            for(SerializedProduct sp: [SELECT Id, ProductItemId, Product2Id, Status, SerialNumber   FROM SerializedProduct WHERE Status='Sent' AND Product2Id =: prodcutId  AND SerialNumber IN: serialNumbers]){
                If(prdtItemMap.containsKey(sp.Product2Id) && String.isBlank(sp.ProductItemId)){
                    sp.ProductItemId = prdtItemMap.get(sp.Product2Id);
                    sp.Return_Date__c = returnDate;
                    sp.Status = 'Available';
                    serilizedproductsList.add(sp);
                }
            }
            
            
            //send updated list to flow and flow will update the records
            List<Response> results = new List<Response>();
            Response objResponse = new Response();
            objResponse.serializedProducts = serilizedproductsList;
            
            results.add(objResponse);
            
            return results;
        }catch(Exception e){
            throw new MarkAsReturnControllerException(e.getMessage());
        }
        
    }
    
    public class MarkAsReturnControllerException Extends Exception{}
    
    public class Requests {
        @InvocableVariable
        public String prodcutId; 
        @InvocableVariable
        public String locationId;  
        @InvocableVariable
        public Date returnDate;  
        @InvocableVariable
        public List<string> serialNumbers;  
    }
    
    Public Class Response{
        @InvocableVariable
        public List<SerializedProduct> serializedProducts;  
    }
    
}