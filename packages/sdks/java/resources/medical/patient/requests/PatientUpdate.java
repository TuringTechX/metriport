/**
 * This file was auto-generated by Fern from our API Definition.
 */

package resources.medical.patient.requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import core.ObjectMappers;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
import java.util.Objects;
import resources.medical.patient.types.BasePatient;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonDeserialize(
    builder = PatientUpdate.Builder.class
)
public final class PatientUpdate {
  private final String facilityId;

  private final BasePatient body;

  private PatientUpdate(String facilityId, BasePatient body) {
    this.facilityId = facilityId;
    this.body = body;
  }

  /**
   * @return The ID of the Facility where the patient is receiving care.
   */
  @JsonProperty("facilityId")
  public String getFacilityId() {
    return facilityId;
  }

  @JsonProperty("body")
  public BasePatient getBody() {
    return body;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) return true;
    return other instanceof PatientUpdate && equalTo((PatientUpdate) other);
  }

  private boolean equalTo(PatientUpdate other) {
    return facilityId.equals(other.facilityId) && body.equals(other.body);
  }

  @Override
  public int hashCode() {
    return Objects.hash(this.facilityId, this.body);
  }

  @Override
  public String toString() {
    return ObjectMappers.stringify(this);
  }

  public static FacilityIdStage builder() {
    return new Builder();
  }

  public interface FacilityIdStage {
    BodyStage facilityId(String facilityId);

    Builder from(PatientUpdate other);
  }

  public interface BodyStage {
    _FinalStage body(BasePatient body);
  }

  public interface _FinalStage {
    PatientUpdate build();
  }

  @JsonIgnoreProperties(
      ignoreUnknown = true
  )
  public static final class Builder implements FacilityIdStage, BodyStage, _FinalStage {
    private String facilityId;

    private BasePatient body;

    private Builder() {
    }

    @Override
    public Builder from(PatientUpdate other) {
      facilityId(other.getFacilityId());
      body(other.getBody());
      return this;
    }

    /**
     * <p>The ID of the Facility where the patient is receiving care.</p>
     * @return Reference to {@code this} so that method calls can be chained together.
     */
    @Override
    @JsonSetter("facilityId")
    public BodyStage facilityId(String facilityId) {
      this.facilityId = facilityId;
      return this;
    }

    @Override
    @JsonSetter("body")
    public _FinalStage body(BasePatient body) {
      this.body = body;
      return this;
    }

    @Override
    public PatientUpdate build() {
      return new PatientUpdate(facilityId, body);
    }
  }
}