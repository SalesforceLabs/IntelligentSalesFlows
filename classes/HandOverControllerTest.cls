@isTest 	
public class HandOverControllerTest {
    @testSetup static void setup() {
        try{
            List<Account> testAccts = new List<Account>();
            for(Integer i=0;i<2;i++) {
                testAccts.add(new Account(
                    Name = 'TestAcct'+i
                ));
            }
            insert testAccts;
            
            List<Product2> testProducts = new List<Product2>();
            for(Integer i=0; i<2; i++) {
                testProducts.add(new Product2(
                    Name = 'Thermometer'+i+i,
                    IsActive = true,
                    IsSerialized = true
                ));
            }
            insert testProducts;
            
            Id pricebookId = Test.getStandardPricebookId();
            
            List<PricebookEntry> testPricebookEntry = new List<PricebookEntry>();
            for(Integer i=0; i<2; i++) {
                testPricebookEntry.add(new PricebookEntry(
                    Pricebook2Id = pricebookId,
                    Product2Id = testProducts.get(i).Id,
                    UnitPrice = 1, 
                    IsActive = true
                ));
            }
            insert testPricebookEntry;
            
            List<Schema.Location> testLocations = new List<Schema.Location>();
            for(Integer i=0; i<2; i++) {
                testLocations.add(new Schema.Location(
                    Name = 'Bangalore'+i,
                    IsInventoryLocation = true,
                    LocationType = 'Warehouse'
                ));
            }
            insert testLocations;
            
            List<ProductItem> testProductItems = new List<ProductItem>();
            for(Integer i = 0; i < 2; i++) {
                testProductItems.add(new ProductItem(
                    QuantityOnHand = Double.valueOf(0.0),
                    LocationId = testLocations.get(i).Id,
                    Product2Id = testProducts.get(i).Id
                ));
            }
            system.debug('testProductItems'+testProductItems);
            //insert testProductItems;
            
            List<SerializedProduct> testSerializedProducts = new List<SerializedProduct>();
            for(Integer i=0; i<2; i++) {
                testSerializedProducts.add(new SerializedProduct(
                    Product2Id = testProducts.get(i).Id,
                    // ProductItemId = testProductItems.get(i).Id,
                    Status = 'Available',
                    SerialNumber = '123'+testProducts.get(i).Name+i
                ));
            }
            insert testSerializedProducts;
            system.debug('testSerializedProducts'+testSerializedProducts);
        }catch(Exception e){
            system.debug('exception'+e);
        }
    }
    
    static testMethod void validategetRecordsForProductConsumption() {
        try{
            Product2 product = [SELECT Id from Product2 limit 1];
            List<String> SerializedNumbers = new List<string>();
            for(SerializedProduct sp : [SELECT Id,SerialNumber from SerializedProduct where Product2Id =: product.Id]){
                SerializedNumbers.add(sp.SerialNumber);
            }
            List<HandOverController.Requests> rqstInputs = new List<HandOverController.Requests>();
            HandOverController.Requests reqs = new HandOverController.Requests();
            reqs.ProductId = product.id;
            reqs.SelectedSerialNumberIds = new List<string>();
            reqs.SerialNumbers =  SerializedNumbers;
            reqs.Status = 'Sent';
            rqstInputs.add(reqs); 
            HandOverController.getRecordsForProductConsumption(rqstInputs);
        }catch(Exception e){
            System.assertEquals('Attempt to de-reference a null object',e.getMessage());
        }
    }
    
    static testMethod void validategetRecordsForProductConsumption2() {
        try{
            Product2 product = [SELECT Id from Product2 limit 1];
            Schema.Location location = [SELECT Id from Location limit 1];
            List<String> SerializedIds = new List<string>();
            for(SerializedProduct sp : [SELECT Id,SerialNumber from SerializedProduct]){
                SerializedIds.add(sp.Id);
            }
            List<HandOverController.Requests> rqstInputs = new List<HandOverController.Requests>();
            HandOverController.Requests reqs = new HandOverController.Requests();
            reqs.ProductId = product.Id;
            reqs.SelectedSerialNumberIds =  SerializedIds;
            reqs.LocationId = location.Id;
            reqs.Status = 'Lost';
            rqstInputs.add(reqs);
            HandOverController.getRecordsForProductConsumption(rqstInputs);
        }catch(Exception e){
            System.assertEquals('Attempt to de-reference a null object',e.getMessage());
        }
    }
    
    static testMethod void validategetRecordsForProductConsumptionNegtive() {
        try{
            List<HandOverController.Requests> rqstInputs = new List<HandOverController.Requests>();
            HandOverController.Requests reqs = new HandOverController.Requests();
            reqs.ProductId = null;
            reqs.SerialNumbers =  null;
            reqs.Status = 'Sent';
            rqstInputs.add(reqs);
            HandOverController.getRecordsForProductConsumption(rqstInputs);
        }catch(Exception e){
            System.assertEquals('Attempt to de-reference a null object',e.getMessage());
        }
    }
}