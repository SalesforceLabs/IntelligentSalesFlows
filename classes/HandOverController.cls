public class HandOverController {
    
    @InvocableMethod(label='Update Product Consumption' description='Updates Product Consumption in SerializedProduct' category='SerializedProduct')
    public static List<Response> getRecordsForProductConsumption(List<Requests> rqstInputs){
        try{
            
            if(rqstInputs == null) return new List<Response>();
            
            //input varaibles from flow
            String ProductId = rqstInputs[0]?.ProductId;
            String LocationId = rqstInputs[0]?.LocationId;
            String Status = rqstInputs[0]?.Status;
            List<String> serialNumbers = rqstInputs[0]?.serialNumbers;
            String scannedSerialNumbers = rqstInputs[0]?.SelectedSerialNumberIds;
            
            List<SerializedProduct> products = new List<SerializedProduct>();
            set<Id> setProductItemIds = new set<Id>();
            
            String Query = 'SELECT Id, ProductItemId, Status FROM SerializedProduct WHERE Product2Id =: productId';
            
            if(String.isNotEmpty(scannedSerialNumbers) && String.isNotEmpty(LocationId)){
                List<Id> serialNumberIds = scannedSerialNumbers?.split(';');
                Query += ' AND ProductItem.LocationId =:LocationId  AND Id IN: serialNumberIds'; 
            }else
                Query += ' AND SerialNumber IN: serialNumbers';
            
            for(SerializedProduct sp: Database.query(Query)){
                sp.ProductItemId = null;
                sp.Status = Status;
                products.add(sp);
            }
            
            //send updated list to flow and flow will update the records
            return new List<Response>{ new Response(products) };
                
                }catch(Exception e){
                    throw new HandOverControllerException(e.getMessage());
                }
        
    }
    
    public class HandOverControllerException Extends Exception{}
    
    public class Requests {
        @InvocableVariable
        public String ProductId;
        
        @InvocableVariable
        public String LocationId; 
        
        @InvocableVariable
        public List<string> SerialNumbers; 
        
        @InvocableVariable
        public String Status; 
        
        @InvocableVariable
        public String SelectedSerialNumberIds;
    }
    
    Public Class Response{
        @InvocableVariable
        public List<SerializedProduct> serializedProducts;  
        
        Response(List<SerializedProduct> serializedProducts){
            this.serializedProducts = serializedProducts;
        }
    }
}