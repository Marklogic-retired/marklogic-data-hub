     /*
     * Create Content Plugin
     *
     * @param id         - the identifier returned by the collector
     * @param options    - an object containing options. Options are sent from Java
     *
     * @return - your content
     */
    function createContent(id, options) {
      var doc = cts.doc(id);
      var root = doc.root.toObject();
    
      var source;
      var opts;
    
      // for xml we need to use xpath
      if (root && xdmp.nodeKind(root) === 'element') {
        source = root.xpath('/*:envelope/*:instance/node()');
      }
      // for json we need to return the instance
      else if (root && root.envelope && root.envelope.instance) {
        source = root.envelope.instance;
        opts = options;
      }
      // for everything else
      else {
        source = doc;
      }
    
      return extractInstanceProduct(source, opts);
    }
    
    /**
     * Creates an object instance from some source document.
     * @param source  A document or node that contains
     *   data for populating a Product
     * @return An object with extracted data and
     *   metadata about the instance.
     */
    function extractInstanceProduct(source, opts) {
      // the original source documents
      var attachments = source;
    
      var sku = xs.string(source.sku || source.SKU);
      var title = xs.string(source.title);
      var price = xs.decimal(source.price);
      var value1 = xs.string(opts.hello);
      var value2 = xs.string(opts.myNumber);
      
      // return the instance object
      return {
        '$attachments': attachments,
        '$type': 'Product',
        '$version': '0.0.1',
        'sku': sku,
        'title': title,
        'price': price,
        'opt1': value1,
        'opt2': value2
      }
    };
    
    
    function makeReferenceObject(type, ref) {
      return {
        '$type': type,
        '$ref': ref
      };
    }
    
    module.exports = {
      createContent: createContent
    };