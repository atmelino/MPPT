

boolean MODE_PWM_MPPT, MODE_PWM_POT, MODE_PWM_SER;


void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  MODE_PWM_MPPT = true;
}

void loop() {
  // put your main code here, to run repeatedly:
  //Serial.println(true);
  Serial.println(MODE_PWM_MPPT);
  Serial.print("Mode MPPT  ");
  Serial.print(MODE_PWM_MPPT);
  Serial.print(" POT  ");
  Serial.print(MODE_PWM_POT);
  Serial.print(" SERIAL ");
  Serial.println(MODE_PWM_SER);

  delay(1000);
}
