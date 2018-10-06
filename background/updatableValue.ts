class UpdatableValue<T> {
	private value:T = undefined;

	getValue():T {
		return this.value;
	}

	update(newValue:T) {
		if(newValue !== undefined)
			this.value = newValue;
	}
}