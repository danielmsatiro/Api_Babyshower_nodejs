import {
  generateAdministrator,
  generateAdvert,
  generateCompany,
  generateToken,
  IAdvert,
} from "..";
import { Advert } from "../../entities/adverts.entity";
import supertest from "supertest";
import app from "../../app";
import { validate, v4 as uuid } from "uuid";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Company } from "../../entities/companies.entity";
import { Administrator } from "../../entities/administrators.entity";
import { CategoryAdvert } from "../../entities/categoryAdverts.entity";

/* describe("Create advert route by company | Integration Test", () => {
  let connection: DataSource;

  let tokenAdm: string;
  let tokenCompany: string;
  let advert: Partial<IAdvert> = generateAdvert();
  let adm: Administrator;
  let company: Company;
  let otherCompany: Company;

  beforeAll(async () => {
    await AppDataSource.initialize()
      .then((res) => (connection = res))
      .catch((err) => {
        console.error("Error during Data Source initialization", err);
      });

    //add admnistrator
    const admRepo = connection.getRepository(Administrator);
    adm = Object.assign(new Administrator(), () => {
      const { password, ...newPayload } = generateAdministrator();
      return {
        ...newPayload,
        passwordHash: "passwordHash",
      };
    });
    adm = await admRepo.save(adm);
    tokenAdm = generateToken(adm.id as string);

    //add company
    const companyRepo = connection.getRepository(Company);
    company = Object.assign(new Company(), () => {
      const { password, ...newPayload } = generateCompany();
      return {
        ...newPayload,
        passwordHash: "passwordHash",
      };
    });
    company = await companyRepo.save(company);
    tokenCompany = generateToken(company.id as string);

    //add other company
    otherCompany = Object.assign(new Company(), () => {
      const { password, ...newPayload } = generateCompany();
      return {
        ...newPayload,
        passwordHash: "passwordHash",
      };
    });
    otherCompany = await companyRepo.save(otherCompany);
  });

  afterAll(async () => {
    await connection.destroy();
  });

  it("Return: Advert as JSON response | Status code 201", async () => {
    const response = await supertest(app)
      .post(`/adverts/byCompany/${company.id}`)
      .set("Authorization", "Bearer " + tokenCompany)
      .send({ ...advert });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(["id"]);
    expect(validate(response.body.id)).toBeTruthy();
    expect(response.body).toEqual(expect.objectContaining({ ...advert }));
  });

  it("Return: Advert as JSON response image and linkAdverts as undefined | Status code 201", async () => {
    const { image, linkAdverts, ...newAdvert } = advert;

    const response = await supertest(app)
      .post(`/adverts/byCompany/${company.id}`)
      .set("Authorization", "Bearer " + tokenCompany)
      .send({ ...newAdvert });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(["id"]);
    expect(response.body).toHaveProperty(["image"]);
    expect(response.body).toHaveProperty(["linkAdverts"]);
    expect(validate(response.body.id)).toBeTruthy();
    expect(response.body).toEqual(expect.objectContaining({ ...newAdvert }));
  });

  it("Return: Advert as JSON response token ADM | Status code 201", async () => {
    const response = await supertest(app)
      .post(`/adverts/byCompany/${company.id}`)
      .set("Authorization", "Bearer " + tokenAdm)
      .send({ ...advert });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(["id"]);
    expect(validate(response.body.id)).toBeTruthy();
    expect(response.body).toEqual(expect.objectContaining({ ...advert }));
  });

  it("Return: Body error, missing token | Status code: 400", async () => {
    const response = await supertest(app)
      .post(`/adverts/byCompany/${company.id}`)
      .send({ ...advert });

    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({
      Error: "Missing authorization token",
    });
  });

  it("Return: Body error, missing some mandatory-key | Status code: 400", async () => {
    const { title, description, ...newAdvert } = advert;

    const response = await supertest(app)
      .post(`/adverts/byCompany/${company.id}`)
      .set("Authorization", "Bearer " + tokenCompany)
      .send({ ...newAdvert });

    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({
      errors: ["password is a required field"],
    });
  });

  it("Return: Body error, invalid token | Status code: 401", async () => {
    const token = "invalidToken";

    const response = await supertest(app)
      .post(`/adverts/byCompany/${company.id}`)
      .set("Authorization", "Bearer " + token)
      .send({ ...advert });

    expect(response.status).toBe(401);
    expect(response.body).toStrictEqual({
      Error: "Invalid Token",
    });
  });

  it("Return: Body error, no permission | Status code: 403", async () => {
    const response = await supertest(app)
      .post(`/adverts/byCompany/${otherCompany.id}`)
      .set("Authorization", "Bearer " + tokenCompany)
      .send({ ...advert });

    expect(response.status).toBe(403);
    expect(response.body).toStrictEqual({
      Error: "You are not allowed to access this information",
    });
  });

  it("Return: Body error, company not found | Status code: 404", async () => {
    const response = await supertest(app)
      .post(`/adverts/byCompany/${adm.id}`)
      .set("Authorization", "Bearer " + tokenCompany)
      .send({ ...advert });

    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({
      Message: "Company not found",
    });
  });
});

describe("Get adverts | Integration Test", () => {
  let connection: DataSource;

  let adverts: Advert[];

  beforeAll(async () => {
    await AppDataSource.initialize()
      .then((res) => (connection = res))
      .catch((err) => {
        console.error("Error during Data Source initialization", err);
      });

    //insert 10 companies with 1 advert
    const companyRepo = connection.getRepository(Company);
    const advertRepo = connection.getRepository(Advert);
    const categoryRepo = connection.getRepository(CategoryAdvert);
    for (let i = 1; i <= 10; i++) {
      const company = await companyRepo.save(
        Object.assign(new Company(), () => {
          const { password, ...newPayload } = generateCompany();
          return {
            ...newPayload,
            passwordHash: "passwordHash",
          };
        })
      );

      const advert = await advertRepo.save(
        Object.assign(new Advert(), async () => {
          const advert = generateAdvert();
          const category = await categoryRepo.findOneBy({
            title: i <= 5 ? "Premium" : "Black",
          });
          return {
            ...advert,
            company: company,
            category: category,
          };
        })
      );
      adverts.push(advert);
    }
  });

  afterAll(async () => {
    await connection.destroy();
  });

  it("Return: Companies as JSON response | Status code: 200", async () => {
    console.log(adverts);

    const response = await supertest(app).get("/companies");

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(8);
  });

  /* it("Return: Companies as JSON response page 2 | Status code: 200", async () => {
    const response = await supertest(app)
      .get("/companies?page=2")
      .set("Authorization", "Bearer " + tokenAdm);
    const { passwordHash, adverts, comparePwd, ...company } = newCompany;
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(2);
  }); */

/* it("Return: Companies as JSON response perPage 4 | Status code: 200", async () => {
    const response = await supertest(app)
      .get("/companies?page=2")
      .set("Authorization", "Bearer " + tokenAdm);
    const { passwordHash, adverts, comparePwd, ...company } = newCompany;
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(4);
  });

  it("Return: Companies as JSON response page 2 perPage 4 | Status code: 200", async () => {
    const response = await supertest(app)
      .get("/companies?page=2")
      .set("Authorization", "Bearer " + tokenAdm);
    const { passwordHash, adverts, comparePwd, ...company } = newCompany;
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(5);
  });

  it("Return: Body error, missing token | Status code: 400", async () => {
    const response = await supertest(app).get("/companies");
    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({
      Error: "Missing authorization token",
    });
  });

  it("Return: Body error, invalid token | Status code: 401", async () => {
    const token = "invalidToken";

    const response = await supertest(app)
      .get("/companies")
      .set("Authorization", "Bearer " + token);

    expect(response.status).toBe(401);
    expect(response.body).toStrictEqual({
      Error: "Invalid Token",
    });
  });

  it("Return: Body error, no permision | Status code: 401", async () => {
    const response = await supertest(app)
      .get("/companies")
      .set("Authorization", "Bearer " + tokenCompany);

    expect(response.status).toBe(401);
    expect(response.body).toStrictEqual({
      Error: "You are not allowed to access this information",
    });
  }); */
/*});
 */
