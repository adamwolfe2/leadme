-- Atomic partner payout: decrement balance and increment total_paid_out in one transaction
-- Prevents race conditions between concurrent payouts

CREATE OR REPLACE FUNCTION process_partner_payout(
  p_partner_id UUID,
  p_payout_amount NUMERIC
) RETURNS VOID AS $$
BEGIN
  UPDATE partners
  SET
    available_balance = GREATEST(available_balance - p_payout_amount, 0),
    total_paid_out = COALESCE(total_paid_out, 0) + p_payout_amount,
    last_payout_at = NOW()
  WHERE id = p_partner_id
    AND available_balance >= p_payout_amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance or partner not found: %', p_partner_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
