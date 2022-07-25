import { Factory } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { CountryEntity } from 'src/country/entities/country.entity';
import axios from 'axios';

export default class CreateCountriesSeed {
  async getCountries() {
    let countries = await axios({
      method: 'get',
      url: 'https://restcountries.com/v2/all',
      headers: { 'content-type': 'application/json' }
    });
    countries = countries.data;
    const transformedCountries: { [index: string]: string }[] = Object.keys(
      countries
    ).map((key) => ({
      name: countries[key].name as string,
      alphaCode: countries[key].alpha2Code as string,
      alphaCode3: countries[key].alpha3Code as string,
      alternateSpellings: countries[key].altSpellings ?? [],
      callingCodes: countries[key].callingCodes,
      currencies: countries[key].currencies,
      languages: countries[key].languages,
      flag: countries[key].flag as string
    }));
    return transformedCountries;
  }

  public async run(factory: Factory, connection: Connection): Promise<any> {
    const countries = await connection
      .createQueryBuilder()
      .from(CountryEntity, 'countries')
      .getRawMany();
    if (!Object.keys(countries).length) {
      await connection
        .createQueryBuilder()
        .insert()
        .into(CountryEntity)
        .values(await this.getCountries())
        .orIgnore()
        .execute();
    }
  }
}
