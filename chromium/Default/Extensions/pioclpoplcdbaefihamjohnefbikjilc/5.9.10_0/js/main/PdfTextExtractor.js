importScripts("../../third_party/pdfjs/cidmaps.js");
importScripts("../../third_party/pdfjs/core.js");
importScripts("../../third_party/pdfjs/image.js");
importScripts("../../third_party/pdfjs/evaluator.js");
importScripts("../../third_party/pdfjs/fonts.js");
importScripts("../../third_party/pdfjs/glyphlist.js");
importScripts("../../third_party/pdfjs/obj.js");
importScripts("../../third_party/pdfjs/crypto.js");
importScripts("../../third_party/pdfjs/parser.js");
importScripts("../../third_party/pdfjs/pdf.js");
importScripts("../../third_party/pdfjs/jpg.js");
importScripts("../../third_party/pdfjs/jpx.js");
importScripts("../../third_party/pdfjs/jbig2.js");
importScripts("../../third_party/pdfjs/stream.js");
importScripts("../../third_party/pdfjs/colorspace.js");
importScripts("../../third_party/pdfjs/util.js");
importScripts("../../thrift/gen/Limits_types.js");
importScripts("../GlobalUtils.js");

addEventListener("message", function(evt) {
  var pdfModel = new PDFDocument(new Stream(evt.data.pdf), null);
  var numPages = pdfModel.numPages;
  var text = "";
  var maxLength = Math.floor(EDAM_RELATED_PLAINTEXT_LEN_MAX / numPages);
  for (var p = 0; p < numPages; p++) {
    text += takePortionOfPage(GlobalUtils.removePunctuation(pdfModel
      .getPage(p + 1).extractTextContent().bidiTexts).replace(/\s+/g, " ")
      .trim(), maxLength);
  }
  postMessage({ type: "recommendationText", message: text });
}, false);

function takePortionOfPage(text, maxLength) {
  // don't want to cut a word in half, so if the cut point is on a character,
  // go closer to the beginning to find a white space
  if (maxLength < 0) {
    return "";
  }
  if (text[maxLength] == " " || typeof text[maxLength] == "undefined") {
    return " " + text.slice(0, maxLength);
  }
  else {
    return takePortionOfPage(text, maxLength - 1);
  }
}