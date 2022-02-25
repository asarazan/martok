//Generated when event is triggered
export type CallSessionUpdate = {
  callSession: CallSession;
  callActionContext: CallActionContext;
};

export type CallActionContext = {
  actionType: CallActionType;
  userId: string;
};

export type CallActionType =
  | "call"
  | "leaveCall"
  | "acceptCall"
  | "checkCalls"
  | "updateAgoraId"
  | "backgroundStateUpdate";

//Stored information
export type CallSession = {
  /**
   * ID of the call session. This is the same as the Agora room ID.
   */
  id: string;

  callState: "pending" | "onCall" | "cancelled" | "completed" | "disconnected";
  /**
   * Date time when the "Sender" initiates a call
   */
  ringStartDateTime: string; /// Put in times, dates

  /**
   * Date time when the first "Receiver" picks up the call
   */
  callStartDateTime?: string;

  /**
   * Date time when everyone leaves the call (less than 2 users in the call)
   */
  callEndDateTime?: string;

  participants: Participant[];

  /**
   * A timestamp indicating when this call session was broadcasted to the call room
   */
  updateTimestamp?: number;

  gameSessionId?: string;
};

export type Participant = {
  /**
   * Reference to Firebase userId.
   */
  userId: string;
  agoraUid?: string;
  phoneNumber: string;
  displayNumber: string;

  /**
   * Sender indicates that the user initiated the call. Receiver is someone who receives the call.
   */
  role: "receiver" | "sender";

  /**
   * User accepted the call.
   */
  accepted: boolean;

  /**
   * User has already joined the call, then left
   */
  departed: boolean;

  /**
   * Indicating if that participant's app is in a backgrounded state.
   */
  backgrounded: boolean;
  firstName: string;
  lastName: string;
};
/* 
We can use accepted and departed to infer the user intent

accepted == false && departed == false:
- Nothing has been done

accepted == true && departed = false:
- If participant is receiver => participant has accepted the call
- Sender => participant has made the outgoing call

accepted == true && departed = true:
- The participant went on the call and alredy left the call 

accepted = false && departed == true:
- Receiver => Participant has declined the call
- Sender => Participant has cancelled the outgoing call 

*/
