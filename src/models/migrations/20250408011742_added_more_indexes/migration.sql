-- CreateIndex
CREATE INDEX "City_name_idx" ON "City"("name");

-- CreateIndex
CREATE INDEX "CityPopulation_year_idx" ON "CityPopulation"("year");

-- CreateIndex
CREATE INDEX "CityPopulation_value_idx" ON "CityPopulation"("value");

-- CreateIndex
CREATE INDEX "Country_name_idx" ON "Country"("name");

-- CreateIndex
CREATE INDEX "CountryPopulation_year_idx" ON "CountryPopulation"("year");

-- CreateIndex
CREATE INDEX "CountryPopulation_value_idx" ON "CountryPopulation"("value");

-- CreateIndex
CREATE INDEX "State_name_idx" ON "State"("name");
