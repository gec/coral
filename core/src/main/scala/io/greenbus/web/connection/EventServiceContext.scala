package io.greenbus.web.connection

import io.greenbus.client.ServiceHeaders
import io.greenbus.client.service.EventService

/**
 * Mixin trait for accessing a EventService.
 *
 * @author Flint O'Brien
 */
trait EventServiceContext {

  /**
   * Return a EventService client.
   * @param authToken Required authToken for service requests
   * @return EventService
   * @throws SessionUnavailableException if session is unavailable
   */
  def eventService( authToken: String): EventService
}

trait EventServiceContextImpl extends EventServiceContext {
  this: SessionContext =>

  /** @inheritdoc */
  override def eventService( authToken: String): EventService = {
    session match {
      case Some(s) =>
        val newSession = s.spawn
        newSession.addHeader( ServiceHeaders.tokenHeader, authToken)
        EventService.client( newSession)
      case None =>
        throw new SessionUnavailableException( "EventService is unavailable because session is unavailable.")
    }
  }
}
