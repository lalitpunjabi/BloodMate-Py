from app.db.models import BloodGroupEnum


COMPATIBLE_DONOR_GROUPS = {
    BloodGroupEnum.A_POS: [
        BloodGroupEnum.A_POS,
        BloodGroupEnum.A_NEG,
        BloodGroupEnum.O_POS,
        BloodGroupEnum.O_NEG,
    ],
    BloodGroupEnum.A_NEG: [BloodGroupEnum.A_NEG, BloodGroupEnum.O_NEG],
    BloodGroupEnum.B_POS: [
        BloodGroupEnum.B_POS,
        BloodGroupEnum.B_NEG,
        BloodGroupEnum.O_POS,
        BloodGroupEnum.O_NEG,
    ],
    BloodGroupEnum.B_NEG: [BloodGroupEnum.B_NEG, BloodGroupEnum.O_NEG],
    BloodGroupEnum.AB_POS: [
        BloodGroupEnum.A_POS,
        BloodGroupEnum.A_NEG,
        BloodGroupEnum.B_POS,
        BloodGroupEnum.B_NEG,
        BloodGroupEnum.AB_POS,
        BloodGroupEnum.AB_NEG,
        BloodGroupEnum.O_POS,
        BloodGroupEnum.O_NEG,
    ],
    BloodGroupEnum.AB_NEG: [
        BloodGroupEnum.A_NEG,
        BloodGroupEnum.B_NEG,
        BloodGroupEnum.AB_NEG,
        BloodGroupEnum.O_NEG,
    ],
    BloodGroupEnum.O_POS: [BloodGroupEnum.O_POS, BloodGroupEnum.O_NEG],
    BloodGroupEnum.O_NEG: [BloodGroupEnum.O_NEG],
}


def get_compatible_donor_groups(recipient_group: BloodGroupEnum) -> list[BloodGroupEnum]:
    return COMPATIBLE_DONOR_GROUPS.get(recipient_group, [])
