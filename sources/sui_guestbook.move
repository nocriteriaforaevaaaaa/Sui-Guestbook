module sui_guestbook::sui_guestbook {

   
    use sui::event;
    public struct EventNewMessage has copy, drop {
        sender: address,
    }

    public struct Message has copy, drop, store {
        sender: address,
        content: vector<u8>,
        timestamp: u64,
    }

    public struct Guestbook has key, store {
        id: UID,
        messages: vector<Message>,
    }

    public entry fun create_guestbook(ctx: &mut TxContext) {
        let book = Guestbook {
            id: object::new(ctx),
            messages: vector::empty<Message>(),
        };
        transfer::transfer(book, tx_context::sender(ctx));
    }

    public entry fun post_message(book: &mut Guestbook, content: vector<u8>, ctx: &mut TxContext) {
        let msg = Message {
            sender: tx_context::sender(ctx),
            content,
            timestamp: 0,
        };
        vector::push_back(&mut book.messages, msg);
        event::emit<EventNewMessage>(EventNewMessage { sender: tx_context::sender(ctx) });
    }
}
