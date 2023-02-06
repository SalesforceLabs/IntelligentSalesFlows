**Intelligent Sales Sample Flow for Field Inventory Management**

**## Overview**

The Intelligent Sales Sample Flows for Field Inventory Management Sample enable your sales team to capture and fulfill different types of product requests, keep track of inventory for serialized products, and ensure regulatory compliances are met. By accessing these flows from their mobile devices, sales reps can easily perform important tasks on the go. 

**## Business Objective**

These Sample flows help organizations accelerate the launch of their inventory processes of Sample, Trial, and Loaner Management along with enabling them to create Cycle Count mismatch actions quickly with flows of Mark as Lost and Relate to Order flows. 

**## Business Value and Benefits**

* Increased provider satisfaction
* Increased product revenue
* Reduction in product write-offs
* Increased Sales Reps’ productivity 

**### Industry**

* Healthcare- Life sciences
* Healthcare - Medical Technology

**### User Persona**

* Sales Representatives

**### User Workflow**

* *Sample Request Management (Request Capture and Request Fulfillment)*
    * This flow captures the provider's request for a sample product, then fulfills the request when the product is delivered to the provider
* *Trial Request Management (Request Capture and Request Fulfillment)*
    * This flow captures the provider's request for a trial product, then fulfills the request when the product is delivered to the provider.
* *Loan Request Management (Request Capture and Request Fulfillment)*
    * This flow captures the provider's request for a trial product, then fulfills the request when the product is delivered to the provider.
* *Product Retrieval Management (Retrieval of Trial and Loan Products)*
    * This flow enables the retrieval of a product provided as a loan or a trial.
* *Mark as Lost*
    * This flow updates the serialized product inventory by marking a product as lost during a cycle count. 
* *Relate to Order*
    * The Relate to Order cycle count flow updates the serialized product inventory by relating a product to a new or existing order during a cycle count.

**## Package Includes**

The following are included in the package: 

* Aura
* classes
* flexipages
* flows
* labels
* LWC
* objects
* package.xml
* profiles
* ReadMe
* standardValueSets
* tabs

**## Configuration Requirements**

**### Pre-Install Configuration Steps**

* Intelligent Sales Data Setup
* Enable the Intelligent Sales and Visit Inventory Management
* Assign the ActionPlans, Health Cloud Foundation, and Industries Visits permission sets

**#### Install the Flow Package**

1. Download the package from GitHub.
2. Unzip the file and compress all the folders along with package.xml.
3. Log into Salesforce on Workbench. 
4. From the dropdown menu that appears under migration, click *Deploy*.
5. Click *Choose file* and select your compressed file.
6. Select *Check Only,* *Rollback On Error*, and *Single Package*. 
    1. Selecting *Check Only* checks if the deployment will be successful before making permanent changes to your org. If the check fails, fix any issues.
7. Click *Next*.
8. If the deployment is valid, repeat this process without selecting *Check Only* to deploy the flows to your org.

**### Post-Install Configuration Steps**
**Configure the Intelligent Sales Flows**

1. From Setup, in the Quick Find box, enter App Manager, and then select *App Manager*. 
2. Next to Health Cloud - Intelligent Sales, click Dropdown, and then click *Edit*.
3. In App Settings, click *Navigation Items*. 
4. In Available Items, move these tabs to the Selected Items column.
    1. Sample Request Management 
    2. Trial Request Management 
    3. Loan Request Management 
    4. Product Retrieval Management
5. *Save* your work.

**##Configure the Intelligent Sales Flows**

1. From Setup, in the Quick Find box, enter Intelligent Sales Settings, then select *Intelligent Sales Settings*.
2. In the Configure Actions Button Visibility section, enable *Cycle Count Products Page* and click *Save*.
3. Open a Visit record.
4. Click the Gear icon, and then click Edit Page.
5. In Lightning App Builder, select *Phone* as the form factor. 
6. Move Visit Overview, Visit Actions, and Task List for Medical Devices components onto the appropriate part of the page.
7. In the Properties pane of Task List for Medical Devices, under Custom Action Flow, select *Show More Actions*.- From *Show More Actions*, you can launch Mark as Lost and Relate to Order flows. 
8. Save the settings and activate your changes.
     

**## Assumptions**

1. A customer has licenses for Health Cloud or Health Cloud for Life-sciences. 
2. Intelligent Sales and Visit Inventory Management are enabled. 
3. ActionPlans, Health Cloud Foundation, and Industries Visits permission sets are assigned to the users. 
4. The sample flows are being used in the Mobile Device. 

**## Revision History**

* V1

