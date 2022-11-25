import { LightningElement, track, wire, api } from 'lwc';
import fetchProductTransfers from '@salesforce/apex/FetchRecordLists.fetchProductTransfers';
import { FlowNavigationNextEvent, FlowNavigationBackEvent } from 'lightning/flowSupport';


export default class OpportunitiesListCMP extends LightningElement {
	@api accountId;
	@api productTransferId;
	@api productList = [];
	@track rowLimit = 2;
	@track rowOffSet = 0;
	@api saveButtonLabel = 'Confirm';
	@api popupButtonLabel = 'Cancel';
	@api selectedSerialNumbersIds = [];
	@api SerializedProducts;
	@track showPopupApp;
	@api popupBodyHeaderAssign;
	@api popupBodyAssign
	@api popUpHeader
	@api availableActions = [];
	@api productId;
	@api fieldValue;
	@api receivedById;

	connectedCallback() {
		this.loadData();
	}

	loadData() {
		return fetchProductTransfers({ productId: this.productId })
			.then(result => {
				console.table(result);
				let updatedRecords = [...this.productList, ...result];
				updatedRecords = updatedRecords.map(row => {
					return {
						...row, ProductName: row.Product2?.Name,
						ReceivedByName: row.ReceivedBy?.Name,
						LocationName: row.SourceLocation?.Name,
						crtDate: row.CreatedDate
					}
				})
				this.productList = updatedRecords;
			})
			.catch(error => {
				console.log('Error' + JSON.stringify(error));
				this.error = error;
				this.productList = undefined;
			});
	}

	handleLoadMore(event) {
		const { target } = event;
		target.isLoading = true;

		this.rowOffSet = this.rowOffSet + this.rowLimit;
		this.loadData()
			.then(() => {
				target.isLoading = false;
			});
	}

	handleRadioChange(event) {
		const valueDet = event.target.dataset.value;
		this.productTransferId = valueDet;
		this.receivedById = this.productList.map(row => {
			if (row.Id == this.productTransferId)
				return row.ReceivedById;
		});
	}

	handleNext() {
		this.showPopupApp = true;
	}

	handleUpdate() {
		this.showPopupApp = false;
		if (this.availableActions.find((action) => action === 'NEXT')) {
			const navigateFinishEvent = new FlowNavigationNextEvent();
			this.dispatchEvent(navigateFinishEvent);
		}
	}

	closeModal() {
		this.showPopupApp = false;
	}

	handlePrevious() {
		if (this.availableActions.find((action) => action === 'BACK')) {
			const navigateBackEvent = new FlowNavigationBackEvent();
			this.dispatchEvent(navigateBackEvent);
		}
	}

}