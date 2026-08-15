/**
 * The rate shown on each slot in the picker.
 *
 * TODO(content): rate card — the client has not supplied one. Hard rule 2 says
 * `/booking` shows a real rupiah amount and `/` shows none; the amount itself is
 * still owed, and **no placeholder number may be invented in the meantime**.
 * An invented price is the one placeholder a visitor would act on: they would
 * arrive at the WhatsApp chat expecting a figure this project made up.
 *
 * So the cell says the true thing instead. When the rate card arrives, this
 * constant becomes a formatter over the real numbers and the marker goes with
 * it — the layout around it is already final.
 */
export const SLOT_PRICE_LABEL = "Harga menyusul";
