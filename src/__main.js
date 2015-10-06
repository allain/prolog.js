/**
 *  Prolog  main file
 * 
 * @author: jldupont
 */

/* global Lexer, ParserL1, ParserL2, ParserL3 */
/* global Op, Compiler
          ,ParseSummary
*/
 
var Prolog = {};

/*
 *
 */
Prolog.compile = function(input_text) {

    var tokens = Prolog.parse(input_text);
    
    var ctokens = Prolog._combine(tokens);
    
    var c = new Compiler();

    var result = [];

    for (var index=0; index<ctokens.length; index++) {
        var code = c.process_rule_or_fact(ctokens[index]);    
        
        result.push(code);
    };
    
    return result;
};



Prolog.parse = function(input_text) {

	var l = new Lexer(input_text);
	var tokens = l.process();

	var t = new ParserL1(tokens);
	var ttokens = t.process();
	
	var p = new ParserL2(ttokens);
	
	var result = p.process();
	var terms = result.terms;
	
	var p3 = new ParserL3(terms, Op.ordered_list_by_precedence);
	var r3 = p3.process();
	
	return r3;
};

/**
 *   Parse sentence by sentence
 *    and return a per-sentence summary of errors, if any.
 * 
 *   @return [ ParseSummary ]
 * 
 */ 
Prolog.parse_per_sentence = function(input_text) {

    var result = [];

	var l = new Lexer(input_text);
	var sentences = l.process_per_sentence();
    
    var p1, p2, p3;
    var p1t, p2t, p3t;
    
    for (var index = 0; index<sentences.length; index++) {
        var sentence = sentences[index];
     
        try {   
            p1  = new ParserL1(sentence);
            p1t = p1.process();
            
            p2  = new ParserL2(p1t);
            p2t = p2.process().terms;
            
            p3  = new ParserL3(p2t, Op.ordered_list_by_precedence);
            p3t = p3.process();
            
            // we should only get 1 root Functor per sentence
            
            result.push( new ParseSummary(null, p3t[0][0]) );
            
        } catch(e) {
            result.push(new ParseSummary(e));
        }   
        
    }
    
    return result;
};


Prolog._combine = function(tokens_list) {
    
    var result = [];
    
    for (var index = 0; index<tokens_list.length; index++) {
        var list = tokens_list[index];
        
        result = result.concat( list );
    };
    
    return result;
};

/**
 * Compiles a query
 * 
 */
Prolog.compile_query = function(input_text) {
    
};

if (typeof module!= 'undefined') {
	module.exports.Prolog = Prolog;
};