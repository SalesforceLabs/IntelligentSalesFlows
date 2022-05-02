({
    handleFlow: function(component, event, helper) {
        const flowInputs = event.getParam('flowDetails');
        
        if(flowInputs.flowName){
            component.set("v.flowName",flowInputs.flowName);
        }else{
            throw ('Invalid Flow')
        }
        
        var navService = component.find("navService");
        var pageReference = {
            "type": "standard__component",
            "attributes": {
                "componentName": "c__navigateToFlow"
            }, 
            "state": {
                'c__ProductId': component.get("v.ProductId"),
                'c__VisitId': component.get("v.VisitId"),
                'c__LocationId': component.get("v.LocationId"),
                'c__ScannedSerialNumbers': component.get("v.ScannedSerialNumbers"),
                'c__flowName': component.get("v.flowName")
            }
        };
        navService.navigate(pageReference);
    },
    
    handleClick: function(cmp, event, helper) {
        /**alert('https://medtech1.my.salesforce.com/flow/Mark_Product_for_Order?ProductId='+cmp.get('v.ProductId')+'&&LocationId='+cmp.get('v.LocationId')+'&&ScannedSerialNumbers='+cmp.get('v.ScannedSerialNumbers'))
        cmp.find("navService").navigate({ 
            type: "standard__webPage", 
            attributes: { 
                url: 'https://medtech1.my.salesforce.com/flow/Mark_Product_for_Order?ProductId=01tB0000001qxM6IAI&&LocationId=131B0000000Dr6hIAC'
            } 
        });
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
            "url": "/flow/Mark_Product_for_Order?ProductId=01tB0000001qxM6IAI&&LocationId=131B0000000Dr6hIAC"
        });
        urlEvent.fire();*/
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
            "url": "/flow/Mark_Product_for_Order?ProductId=01tB0000001qxM6IAI&&LocationId=131B0000000Dr6hIAC"
        });
        //urlEvent.fire();
        location.replace("/flow/Mark_Product_for_Order?ProductId=01tB0000001qxM6IAI&&LocationId=131B0000000Dr6hIAC&retURL="+cmp.get("v.VisitId"))
    },
    
    handleInvokeFlow : function(component, event, helper) {
        try {
            component.set("v.flowLaunched",false);
            const flowInputs = event.getParam('flowDetails');
            const flow = component.find("flowId");
            
            const inputVariables = [
                { name : "ProductId", type : "String", value: component.get("v.ProductId") }, 
                { name : "LocationId", type : "String", value: component.get("v.LocationId") },
                { name : "VisitId", type : "String", value: component.get("v.VisitId")  },
                { name : "ScannedSerialNumbers", type : "String", value: component.get("v.ScannedSerialNumbers")}
            ]
            
            if(flowInputs.flowName && inputVariables){
                flow.startFlow(flowInputs.flowName, inputVariables);
            }else{
                throw ('Invalid Flow')
            }
            
        } catch (e) {
            console.error(e);
        }
    }, 
    
    statusChange : function (cmp, event) {
        if (event.getParam('status') === "FINISHED") {
            cmp.set("v.flowLaunched",true);
            $A.get('e.force:refreshView').fire();
        }
    },
    onButtonPressed: function(cmp, event, helper) {
        // Figure out which action was called
        var actionClicked = event.getSource().getLocalId();
        // Fire that action
        var navigate = cmp.get('v.navigateFlow');
        navigate(actionClicked);
    }
})