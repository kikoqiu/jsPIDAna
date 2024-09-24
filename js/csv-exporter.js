"use strict";

/**
 * @typedef {object} ExportOptions
 * @property {string} columnDelimiter
 * @property {string} stringDelimiter
 * @property {boolean} quoteStrings
 */

/**
 * @constructor
 * @param {FlightLog} flightLog 
 * @param {ExportOptions} [opts={}]
 */
 
 
function gencsv(data){

    /* @param {object} value is not a number
     * @returns {string}
     */
    function normalizeEmpty(value) {
        return !!value ? value : "";
    }

    /**
     * @param {array} columns 
     * @returns {string}
     */
    function joinColumns(columns) {
        return _(columns)
            .map(value => 
                _.isNumber(value)
                ? value
                : stringDelim + normalizeEmpty(value) + stringDelim)
            .join(opts.columnDelimiter);
    }

    /**
     * Converts `null` entries in columns and other empty non-numeric values to NaN value string.
     * 
     * @param {array} columns 
     * @returns {string}
     */
    function joinColumnValues(columns) {
        return _(columns)
            .map(value => 
                (_.isNumber(value) || _.value)
                ? value
                : "NaN")
            .join(opts.columnDelimiter);
    }

    let opts = data.opts,
        stringDelim = opts.quoteStrings
            ? opts.stringDelimiter
            : "",
        mainFields = _([joinColumns(data.fieldNames)])
            .concat(_(data.frames)
                .flatten()
                .map(row => joinColumnValues(row))
                .value())
            .join("\n"),
        headers = _(data.sysConfig)
            .map((value, key) => joinColumns([key, value]))
            .join("\n"),
        result = [headers , mainFields];

    return result;
    
};




let CsvExporter = function(flightLog, opts={}) {

    var opts = _.merge({
        columnDelimiter: ",",
        stringDelimiter: "\"",
        quoteStrings: true,
    }, opts);


	let frames = _(flightLog.getChunksInTimeRange(flightLog.getMinTime(), flightLog.getMaxTime()))
			.map(chunk => chunk.frames).value();

	function dump(success){
		let rs=gencsv({
			sysConfig: flightLog.getSysConfig(),
			fieldNames: flightLog.getMainFieldNames(),
			frames: frames,
			opts: opts,
		});
		success(rs[0]+"\n"+rs[1]);
	}
    
    // exposed functions
    return {
        dump: dump,
    };
  
};

let gencsv1 = function(flightLog, opts={}) {

    var opts = _.merge({
        columnDelimiter: ",",
        stringDelimiter: "\"",
        quoteStrings: true,
    }, opts);


	let frames = _(flightLog.getChunksInTimeRange(flightLog.getMinTime(), flightLog.getMaxTime()))
			.map(chunk => chunk.frames).value();

	
	let rs=gencsv({
		sysConfig: flightLog.getSysConfig(),
		fieldNames: flightLog.getMainFieldNames(),
		frames: frames,
		opts: opts,
	});
	return rs;
};

if(false){

let CsvExporter = function(flightLog, opts={}) {

    var opts = _.merge({
        columnDelimiter: ",",
        stringDelimiter: "\"",
        quoteStrings: true,
    }, opts);

    /** 
     * @param {function} success is a callback triggered when export is done
     */
    function dump(success) {
        let frames = _(flightLog.getChunksInTimeRange(flightLog.getMinTime(), flightLog.getMaxTime()))
                .map(chunk => chunk.frames).value(),
            worker = new Worker("js/webworkers/csv-export-worker.js");

        worker.onmessage = event => {
            success(event.data);
            worker.terminate();
        };
        worker.postMessage({
            sysConfig: flightLog.getSysConfig(),
            fieldNames: flightLog.getMainFieldNames(),
            frames: frames,
            opts: opts,
        });
    }

    // exposed functions
    return {
        dump: dump,
    };
};
}