package io.greenbus.web.util

import play.api.libs.json._
import scala.language.implicitConversions

/**
 *
 * Solves the "no unapply fuction" for Enumeration with Json.format
 *
 * ===Example:===
 *
 * import io.greenbus.web.util.EnumUtils
 *
 * implicit val someEnumerationFormat = EnumUtils.enumFormat(SomeEnumeration)
 */
object EnumUtils {
  def enumReads[E <: Enumeration](enum: E): Reads[E#Value] = new Reads[E#Value] {
    def reads(json: JsValue): JsResult[E#Value] = json match {
      case JsString(s) => {
        try {
          JsSuccess(enum.withName(s))
        } catch {
          case _: NoSuchElementException => JsError(s"Enumeration expected of type: '${enum.getClass}', but it does not appear to contain the value: '$s'")
        }
      }
      case _ => JsError("String value expected")
    }
  }

  implicit def enumWrites[E <: Enumeration]: Writes[E#Value] = new Writes[E#Value] {
    def writes(v: E#Value): JsValue = JsString(v.toString)
  }

  implicit def enumFormat[E <: Enumeration](enum: E): Format[E#Value] = {
    Format(EnumUtils.enumReads(enum), EnumUtils.enumWrites)
  }
}