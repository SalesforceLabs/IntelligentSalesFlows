public class HandOverController {
    
    @InvocableMethod(label='Update Product Consumption' description='Updates Product Consumption in SerializedProduct' category='SerializedProduct')
    public static List<Response> getRecordsForProductConsumption(List<Requests> rqstInputs){
        try{
            
            if(rqstInputs == null) return new List<Response>();
            
            //input varaibles from flow
            String productId = rqstInputs[0]?.ProductId;
            String locationId = rqstInputs[0]?.LocationId;
            String status = rqstInputs[0]?.Status;
            List<String> serialNumbers = rqstInputs[0]?.serialNumbers;
            List<String> scannedSerialNumbers = rqstInputs[0]?.SelectedSerialNumberIds;
            
            List<SerializedProduct> products = new List<SerializedProduct>();
            set<Id> setProductItemIds = new set<Id>();
            
            String Query = 'SELECT Id, ProductItemId, Status FROM SerializedProduct WHERE Product2Id =: productId';
            
            if(scannedSerialNumbers!=null && !scannedSerialNumbers.isEmpty())
                Query += ' AND Id IN: scannedSerialNumbers'; 
            else
                Query += ' AND SerialNumber IN: serialNumbers';
            
            for(SerializedProduct sp: Database.query(Query)){
                sp.ProductItemId = null;
                sp.Status = status;
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
        public List<string> SelectedSerialNumberIds;
    }
    
    public Class Response{
        @InvocableVariable
        public List<SerializedProduct> SerializedProducts;  
        
        Response(List<SerializedProduct> SerializedProducts){
            this.SerializedProducts = SerializedProducts;
        }
    }
}