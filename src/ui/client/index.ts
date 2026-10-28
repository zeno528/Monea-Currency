import { calculateAmount, editCalculator, reduceFraction, canConvertAmount, CALCULATOR_CLIENT } from "./calculator";
import { HOME_CLIENT_CORE } from "./core";

export const HOME_CLIENT = HOME_CLIENT_CORE + "\nvar reduceFraction = " + reduceFraction.toString() + ";\nvar canConvertAmount = " + canConvertAmount.toString() + ";\n" + "\nvar calculateAmount = " + calculateAmount.toString() + ";\n" + "var editCalculator = " + editCalculator.toString() + ";\n" + CALCULATOR_CLIENT;

