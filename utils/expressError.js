class expressError extends Error {
	constructor(mes, scode) {
		super();
		this.mes = mes;
		this.scode = scode;
	}
}

module.exports = expressError;
