<?php

$conn = pg_connect("host=blackbox.insdosl.com port=5432 dbname=postgres user=rd006 password=2SYdNNYe");

$result = pg_query($conn, 'SELECT ST_AsEWKT(geom::geometry) FROM blackbox."Manhole";');

while ($obj = pg_fetch_object($result)) {
  echo $obj->st_asewkt.";";
} 
pg_close($conn);
?>