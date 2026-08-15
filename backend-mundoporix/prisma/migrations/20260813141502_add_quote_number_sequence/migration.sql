-- Secuencia atómica para números de cotización (COT-YYYY-NNNNNN)
CREATE SEQUENCE IF NOT EXISTS "quote_number_seq"
  START WITH 1
  INCREMENT BY 1
  NO CYCLE;

SELECT setval(
  'quote_number_seq',
  COALESCE(
    (SELECT MAX(substring("quoteNumber" from '([0-9]+)$')::bigint) FROM quotes),
    1
  ),
  false
);
