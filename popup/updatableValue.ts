class UpdatableValue<T> {
	private oldValue:T = undefined;
	value:T = undefined;

	init(startingValue:T):void {
		this.oldValue = startingValue;
		this.value = startingValue;
	}

	pullChanges():T {
		if(this.oldValue == this.value)
			return undefined;

		this.oldValue = this.value;
		return this.value;
	}
}